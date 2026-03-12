import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  mapHubSpotSubmissionToLeadData,
  readLeadDataFromForm,
  type HubSpotSubmissionField,
} from "@/lib/hubspot";

interface HubSpotFormEventDetail {
  formId?: string;
  instanceId?: string;
}

interface HubSpotV4FormInstance {
  getFormId?: () => string;
  getInstanceId?: () => string;
  getFormFieldValues: () => Promise<HubSpotSubmissionField[]>;
}

declare global {
  interface Window {
    hbspt?: {
      forms?: {
        create: (options: {
          region: string;
          portalId: string;
          formId: string;
          target: string;
          css?: string;
          onFormSubmit?: ($form: unknown) => void;
          onBeforeFormSubmit?: (
            $form: unknown,
            submissionValues: Array<{ name: string; value: string }>
          ) => void;
          onFormSubmitted?: ($form: unknown) => void;
        }) => void;
      };
    };
    HubSpotFormsV4?: {
      getFormFromEvent?: (event: Event) => HubSpotV4FormInstance | null;
    };
  }
}

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeadData) => void;
}

export interface LeadData {
  name: string;
  email: string;
  company: string;
  phone: string;
}

const LEAD_CAPTURE_DIALOG_TITLE_ID = "lead-capture-dialog-title";
const LEAD_CAPTURE_DIALOG_DESCRIPTION_ID = "lead-capture-dialog-description";
const HUBSPOT_PORTAL_ID = "5861764";
const HUBSPOT_FORM_ID = "4ff11aed-2ca9-4d59-89a1-40aa24204eb0";
const HUBSPOT_REGION = "na2";
const HUBSPOT_SCRIPT_SRC = "https://js-na2.hsforms.net/forms/v2.js";

export default function LeadCaptureDialog({
  open,
  onOpenChange,
  onSubmit,
}: LeadCaptureDialogProps) {
  const pendingLeadDataRef = useRef<LeadData | null>(null);
  const hasTriggeredDownloadRef = useRef(false);
  const [formContainerElement, setFormContainerElement] = useState<HTMLDivElement | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !formContainerElement) {
      return;
    }

    let isCancelled = false;
    let scriptLoadHandler: (() => void) | null = null;
    let scriptElementUsed: HTMLScriptElement | null = null;

    const cleanupContainer = () => {
      formContainerElement.innerHTML = "";
    };

    const triggerDownload = (leadDataOverride?: LeadData) => {
      if (hasTriggeredDownloadRef.current) {
        return;
      }

      const leadData =
        leadDataOverride ??
        pendingLeadDataRef.current ??
        readLeadDataFromForm(formContainerElement);

      if (!leadData.email) {
        setFormLoadError("The report could not be generated because the submitted email was missing.");
        return;
      }

      pendingLeadDataRef.current = leadData;
      hasTriggeredDownloadRef.current = true;
      onSubmit(leadData);
    };

    const handleV4SubmissionSuccess = async (event: Event) => {
      const customEvent = event as CustomEvent<HubSpotFormEventDetail | undefined>;
      const detail = customEvent.detail ?? {};

      let v4Form: HubSpotV4FormInstance | null = null;

      try {
        v4Form = window.HubSpotFormsV4?.getFormFromEvent?.(event) ?? null;
      } catch {}

      const eventFormId =
        typeof detail.formId === "string"
          ? detail.formId
          : typeof detail.instanceId === "string"
            ? detail.instanceId
            : undefined;
      const resolvedFormId = eventFormId ?? v4Form?.getFormId?.() ?? v4Form?.getInstanceId?.();

      if (resolvedFormId !== HUBSPOT_FORM_ID) {
        return;
      }

      try {
        const submissionValues = await v4Form?.getFormFieldValues();

        if (submissionValues?.length) {
          const leadData = mapHubSpotSubmissionToLeadData(submissionValues);
          pendingLeadDataRef.current = leadData;
          triggerDownload(leadData);
          return;
        }
      } catch {}

      triggerDownload();
    };

    window.addEventListener(
      "hs-form-event:on-submission:success",
      handleV4SubmissionSuccess as EventListener
    );

    const createForm = () => {
      if (isCancelled) {
        return;
      }

      const formsApi = window.hbspt?.forms?.create;

      if (!formsApi) {
        setIsFormLoading(false);
        setFormLoadError("The HubSpot form could not be initialized.");
        return;
      }

      cleanupContainer();

      try {
        formsApi({
          region: HUBSPOT_REGION,
          portalId: HUBSPOT_PORTAL_ID,
          formId: HUBSPOT_FORM_ID,
          target: "#hubspot-lead-form",
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setIsFormLoading(false);
        setFormLoadError(
          error instanceof Error
            ? `The HubSpot form could not be initialized: ${error.message}`
            : "The HubSpot form could not be initialized."
        );
        return;
      }

      setIsFormLoading(false);
    };

    const handleScriptReady = () => {
      if (isCancelled) {
        return;
      }

      createForm();
    };

    setIsFormLoading(true);
    setFormLoadError(null);
    cleanupContainer();

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${HUBSPOT_SCRIPT_SRC}"]`
    );

    if (window.hbspt?.forms?.create) {
      handleScriptReady();
    } else if (existingScript) {
      scriptElementUsed = existingScript;
      scriptLoadHandler = () => {
        handleScriptReady();
      };
      existingScript.addEventListener("load", scriptLoadHandler, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = HUBSPOT_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = handleScriptReady;
      script.onerror = () => {
        if (isCancelled) {
          return;
        }

        setIsFormLoading(false);
        setFormLoadError("The HubSpot form could not be loaded.");
      };
      document.body.appendChild(script);
      scriptElementUsed = script;
    }

    return () => {
      isCancelled = true;

      if (scriptLoadHandler && scriptElementUsed) {
        scriptElementUsed.removeEventListener("load", scriptLoadHandler);
      }

      if (scriptElementUsed && scriptElementUsed.onload === handleScriptReady) {
        scriptElementUsed.onload = null;
      }

      window.removeEventListener(
        "hs-form-event:on-submission:success",
        handleV4SubmissionSuccess as EventListener
      );

      cleanupContainer();
      setIsFormLoading(false);
      setFormLoadError(null);
      pendingLeadDataRef.current = null;
      hasTriggeredDownloadRef.current = false;
    };
  }, [onOpenChange, onSubmit, open, formContainerElement]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-labelledby={LEAD_CAPTURE_DIALOG_TITLE_ID}
        aria-describedby={LEAD_CAPTURE_DIALOG_DESCRIPTION_ID}
        aria-label="Download your personalized compliance cost report"
        className="lead-capture-dialog w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] overflow-hidden rounded-[20px] border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur sm:max-w-[540px] sm:rounded-[24px]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle id={LEAD_CAPTURE_DIALOG_TITLE_ID}>
            Download your personalized compliance cost report
          </DialogTitle>
          <DialogDescription id={LEAD_CAPTURE_DIALOG_DESCRIPTION_ID}>
            Complete the HubSpot form to download your personalized compliance cost report.
          </DialogDescription>
        </DialogHeader>
        <div className="lead-capture-dialog__body flex flex-col gap-2 p-2 sm:gap-4 sm:p-6">
          <div className="lead-capture-dialog__form-shell relative">
            <div className="lead-capture-dialog__form-viewport">
              <div
                id="hubspot-lead-form"
                ref={setFormContainerElement}
                className="hubspot-form-container min-h-[240px] sm:min-h-[320px]"
              />
            </div>

            {isFormLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[20px] bg-background/85 backdrop-blur-sm sm:gap-4 sm:rounded-[24px]">
                <Spinner className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground">Loading form...</p>
              </div>
            )}
          </div>

          {formLoadError && (
            <p className="text-sm text-destructive">{formLoadError}</p>
          )}

          <p className="lead-capture-dialog__privacy text-xs text-muted-foreground">
            We respect your privacy and will never share your information with third parties.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
