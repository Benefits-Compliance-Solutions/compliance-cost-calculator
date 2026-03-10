import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type HubSpotFieldValue = string | number | boolean | Array<string | number | boolean> | null | undefined;

interface HubSpotSubmissionField {
  name: string;
  value: HubSpotFieldValue;
}

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

function getSubmissionValue(
  submissionValues: HubSpotSubmissionField[],
  candidates: string[]
) {
  for (const candidate of candidates) {
    const match = submissionValues.find(
      (field) => normalizeSubmissionFieldName(field.name) === candidate.toLowerCase()
    );

    const value = normalizeSubmissionFieldValue(match?.value);

    if (value) {
      return value;
    }
  }

  return "";
}

function normalizeSubmissionFieldName(name: string) {
  const normalizedName = name.toLowerCase().trim();
  return normalizedName.split("/").pop() ?? normalizedName;
}

function normalizeSubmissionFieldValue(value: HubSpotFieldValue) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .join(", ");
  }

  if (value == null) {
    return "";
  }

  return String(value).trim();
}

function mapHubSpotSubmissionToLeadData(
  submissionValues: HubSpotSubmissionField[]
): LeadData {
  const firstName = getSubmissionValue(submissionValues, ["firstname"]);
  const lastName = getSubmissionValue(submissionValues, ["lastname"]);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return {
    name:
      fullName ||
      getSubmissionValue(submissionValues, ["fullname", "full_name", "name"]),
    email: getSubmissionValue(submissionValues, ["email"]),
    company: getSubmissionValue(submissionValues, ["company", "company_name"]),
    phone: getSubmissionValue(submissionValues, ["phone", "mobilephone"]),
  };
}

function readLeadDataFromForm(container: HTMLDivElement): LeadData {
  const values: HubSpotSubmissionField[] = Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input[name], select[name], textarea[name]"
    )
  ).map((field) => ({
    name: field.name,
    value:
      field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")
        ? field.checked
          ? field.value
          : ""
        : field.value,
  }));

  return mapHubSpotSubmissionToLeadData(values);
}

const HUBSPOT_PORTAL_ID = "5861764";
const HUBSPOT_FORM_ID = "4ff11aed-2ca9-4d59-89a1-40aa24204eb0";
const HUBSPOT_REGION = "na2";
const HUBSPOT_SCRIPT_SRC = "https://js-na2.hsforms.net/forms/v2.js";
const HUBSPOT_STYLE_ID = "hubspot-form-custom-styles";
const HUBSPOT_STYLE_CONTENT = `
  .hubspot-form-container {
    margin: 0 !important;
    padding: 0 !important;
  }

  .hubspot-form-container .hs-form {
    font-family: inherit !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1.5rem !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .hubspot-form-container .hs-form > div,
  .hubspot-form-container .hs-form .hs-richtext,
  .hubspot-form-container .hs-form .hs-form-field,
  .hubspot-form-container .hs-form .input,
  .hubspot-form-container .hs-form .actions,
  .hubspot-form-container .hs-form .hs_submit {
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .hubspot-form-container fieldset {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    min-inline-size: 0 !important;
    max-width: 100% !important;
  }

  .hubspot-form-container .hs-form-field {
    margin: 0 0 1.5rem 0 !important;
    padding: 0 !important;
  }

  .hubspot-form-container .hs-form-field:last-of-type {
    margin-bottom: 1rem !important;
  }

  .hubspot-form-container .hs-form label {
    display: block !important;
    font-size: 0.875rem !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
    color: hsl(var(--foreground)) !important;
  }

  .hubspot-form-container .hs-input,
  .hubspot-form-container textarea.hs-input,
  .hubspot-form-container select.hs-input {
    width: 100% !important;
    min-height: 3rem !important;
    padding: 0.75rem 1rem !important;
    font-size: 0.95rem !important;
    border: 1px solid hsl(var(--input)) !important;
    border-radius: 0.75rem !important;
    background-color: hsl(var(--background)) !important;
    color: hsl(var(--foreground)) !important;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s !important;
  }

  .hubspot-form-container select.hs-input {
    appearance: none !important;
    background-image:
      linear-gradient(45deg, transparent 50%, hsl(var(--muted-foreground)) 50%),
      linear-gradient(135deg, hsl(var(--muted-foreground)) 50%, transparent 50%) !important;
    background-position:
      calc(100% - 1.25rem) calc(50% + 0.25rem),
      calc(100% - 0.9rem) calc(50% + 0.25rem) !important;
    background-size: 5px 5px, 5px 5px !important;
    background-repeat: no-repeat !important;
  }

  .hubspot-form-container .hs-input:focus,
  .hubspot-form-container textarea.hs-input:focus,
  .hubspot-form-container select.hs-input:focus {
    outline: none !important;
    border-color: hsl(var(--ring)) !important;
    box-shadow: 0 0 0 3px hsl(var(--ring) / 0.12) !important;
  }

  .hubspot-form-container .hs-input::placeholder {
    color: hsl(var(--muted-foreground)) !important;
  }

  .hubspot-form-container .hs-error-msgs {
    list-style: none !important;
    padding: 0 !important;
    margin: 0.25rem 0 0 0 !important;
  }

  .hubspot-form-container .hs-error-msg {
    font-size: 0.75rem !important;
    color: hsl(var(--destructive)) !important;
  }

  .hubspot-form-container .hs-richtext {
    font-size: 0.875rem !important;
    color: hsl(var(--muted-foreground)) !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .hubspot-form-container .hs-richtext strong {
    color: hsl(var(--foreground)) !important;
  }

  .hubspot-form-container .hs-richtext a {
    color: hsl(var(--primary)) !important;
    text-decoration: underline !important;
  }

  .hubspot-form-container .hs_submit {
    margin: 0.5rem 0 0 0 !important;
    padding: 0 !important;
  }

  .hubspot-form-container .hs-button {
    width: 100% !important;
    min-height: 3rem !important;
    padding: 0.75rem 1.25rem !important;
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    color: hsl(var(--primary-foreground)) !important;
    background-color: hsl(var(--primary)) !important;
    border: 1px solid hsl(var(--primary)) !important;
    border-radius: 0.75rem !important;
    cursor: pointer !important;
    transition: background-color 0.2s, box-shadow 0.2s, transform 0.2s !important;
    box-shadow: 0 12px 20px -12px hsl(var(--primary)) !important;
  }

  .hubspot-form-container .hs-button:hover {
    background-color: hsl(var(--primary) / 0.9) !important;
    box-shadow: 0 16px 28px -16px hsl(var(--primary)) !important;
    transform: translateY(-1px) !important;
  }

  .hubspot-form-container .hs-button:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .hubspot-form-container .hs-form-required {
    color: hsl(var(--destructive)) !important;
  }
`;

export default function LeadCaptureDialog({
  open,
  onOpenChange,
  onSubmit,
}: LeadCaptureDialogProps) {
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingLeadDataRef = useRef<LeadData | null>(null);
  const hasTriggeredDownloadRef = useRef(false);
  const [formContainerElement, setFormContainerElement] = useState<HTMLDivElement | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);

  useEffect(() => {
    const existingStyle = document.getElementById(HUBSPOT_STYLE_ID);

    if (existingStyle) {
      existingStyle.textContent = HUBSPOT_STYLE_CONTENT;
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = HUBSPOT_STYLE_ID;
    styleElement.textContent = HUBSPOT_STYLE_CONTENT;
    document.head.appendChild(styleElement);

    return () => {
      styleElement.remove();
    };
  }, []);

  useEffect(() => {
    if (!open || !formContainerElement) {
      return;
    }

    let isCancelled = false;
    let retryTimeoutId: number | null = null;
    let scriptLoadHandler: (() => void) | null = null;
    let scriptElementUsed: HTMLScriptElement | null = null;
    let renderedFormElement: HTMLFormElement | null = null;
    let renderedSubmitButtonElement: HTMLButtonElement | null = null;
    let observer: MutationObserver | null = null;
    let attempts = 0;
    let hasLoggedV4SuccessEvent = false;
    const logPrefix = "[LeadCaptureDialog]";

    const cleanupContainer = () => {
      formContainerElement.innerHTML = "";
    };

    const triggerDownload = (leadDataOverride?: LeadData) => {
      console.log(`${logPrefix} triggerDownload:start`, {
        hasTriggeredDownload: hasTriggeredDownloadRef.current,
        hasPendingLeadData: Boolean(pendingLeadDataRef.current),
      });

      if (hasTriggeredDownloadRef.current) {
        console.log(`${logPrefix} triggerDownload:skipped-already-triggered`);
        return;
      }

      const leadData =
        leadDataOverride ??
        pendingLeadDataRef.current ??
        readLeadDataFromForm(formContainerElement);

      console.log(`${logPrefix} triggerDownload:leadData`, leadData);

      if (!leadData.email) {
        console.log(`${logPrefix} triggerDownload:missing-email`);
        setFormLoadError("The report could not be generated because the submitted email was missing.");
        return;
      }

      pendingLeadDataRef.current = leadData;
      hasTriggeredDownloadRef.current = true;
      console.log(`${logPrefix} triggerDownload:calling-onSubmit`);
      onSubmit(leadData);
      onOpenChange(false);
    };

    const handleV4SubmissionSuccess = async (event: Event) => {
      const customEvent = event as CustomEvent<HubSpotFormEventDetail | undefined>;
      const detail = customEvent.detail ?? {};

      if (!hasLoggedV4SuccessEvent) {
        hasLoggedV4SuccessEvent = true;
        console.log(`${logPrefix} v4:on-submission:success`, detail);
      }

      let v4Form: HubSpotV4FormInstance | null = null;

      try {
        v4Form = window.HubSpotFormsV4?.getFormFromEvent?.(event) ?? null;
      } catch (error) {
        console.log(`${logPrefix} v4:getFormFromEvent:error`, error);
      }

      const eventFormId =
        typeof detail.formId === "string"
          ? detail.formId
          : typeof detail.instanceId === "string"
            ? detail.instanceId
            : undefined;
      const resolvedFormId = eventFormId ?? v4Form?.getFormId?.() ?? v4Form?.getInstanceId?.();

      if (resolvedFormId !== HUBSPOT_FORM_ID) {
        console.log(`${logPrefix} v4:on-submission:success:ignored`, {
          eventFormId,
          resolvedFormId,
        });
        return;
      }

      try {
        const submissionValues = await v4Form?.getFormFieldValues();

        console.log(`${logPrefix} v4:getFormFieldValues`, {
          hasValues: Boolean(submissionValues?.length),
          count: submissionValues?.length ?? 0,
        });

        if (submissionValues?.length) {
          const leadData = mapHubSpotSubmissionToLeadData(submissionValues);
          pendingLeadDataRef.current = leadData;
          triggerDownload(leadData);
          return;
        }
      } catch (error) {
        console.log(`${logPrefix} v4:getFormFieldValues:error`, error);
      }

      triggerDownload();
    };

    window.addEventListener(
      "hs-form-event:on-submission:success",
      handleV4SubmissionSuccess as EventListener
    );
    console.log(`${logPrefix} effect:init`, {
      open,
      hasContainerElement: Boolean(formContainerElement),
    });

    const handleNativeSubmit = () => {
      console.log(`${logPrefix} native-submit`);
      triggerDownload();
    };

    const handleSubmitButtonClick = () => {
      console.log(`${logPrefix} submit-button-click`);
      triggerDownload();
    };

    const attachFormListeners = () => {
      const nextRenderedFormElement = formContainerElement.querySelector("form");
      const nextRenderedSubmitButtonElement =
        formContainerElement.querySelector<HTMLButtonElement>('button[type="submit"], .hsfc-Button');

      console.log(`${logPrefix} attachFormListeners`, {
        hasFormElement: Boolean(nextRenderedFormElement),
        hasSubmitButtonElement: Boolean(nextRenderedSubmitButtonElement),
        hasIframe: Boolean(formContainerElement.querySelector("iframe")),
      });

      if (renderedFormElement !== nextRenderedFormElement) {
        renderedFormElement?.removeEventListener("submit", handleNativeSubmit);
        renderedFormElement = nextRenderedFormElement;
        renderedFormElement?.addEventListener("submit", handleNativeSubmit);
        console.log(`${logPrefix} attachFormListeners:form-listener-updated`, {
          attached: Boolean(renderedFormElement),
        });
      }

      if (renderedSubmitButtonElement !== nextRenderedSubmitButtonElement) {
        renderedSubmitButtonElement?.removeEventListener("click", handleSubmitButtonClick);
        renderedSubmitButtonElement = nextRenderedSubmitButtonElement;
        renderedSubmitButtonElement?.addEventListener("click", handleSubmitButtonClick);
        console.log(`${logPrefix} attachFormListeners:button-listener-updated`, {
          attached: Boolean(renderedSubmitButtonElement),
        });
      }
    };

    const verifyFormRendered = () => {
      if (isCancelled) {
        return;
      }

      const hasRenderedForm = Boolean(
        formContainerElement.querySelector("iframe, form, .hs-form")
      );

      setIsFormLoading(false);
      console.log(`${logPrefix} verifyFormRendered`, {
        hasRenderedForm,
        hasIframe: Boolean(formContainerElement.querySelector("iframe")),
        hasFormElement: Boolean(formContainerElement.querySelector("form")),
        hasHsFormClass: Boolean(formContainerElement.querySelector(".hs-form")),
      });

      if (!hasRenderedForm) {
        setFormLoadError("The HubSpot form rendered empty.");
        return;
      }

      attachFormListeners();

      observer = new MutationObserver(() => {
        attachFormListeners();
      });

      observer.observe(formContainerElement, {
        childList: true,
        subtree: true,
      });
    };

    const createForm = () => {
      if (isCancelled) {
        return;
      }

      const formsApi = window.hbspt?.forms?.create;
      console.log(`${logPrefix} createForm`, {
        hasFormsApi: Boolean(formsApi),
        attempts,
      });

      if (!formsApi) {
        attempts += 1;

        if (attempts >= 20) {
          setIsFormLoading(false);
          setFormLoadError("The HubSpot form could not be initialized.");
          return;
        }

        retryTimeoutId = window.setTimeout(createForm, 250);
        return;
      }

      cleanupContainer();

      try {
        formsApi({
          region: HUBSPOT_REGION,
          portalId: HUBSPOT_PORTAL_ID,
          formId: HUBSPOT_FORM_ID,
          target: "#hubspot-lead-form",
          onFormSubmit: () => {
            console.log(`${logPrefix} hubspot:onFormSubmit`);
            if (!pendingLeadDataRef.current) {
              pendingLeadDataRef.current = readLeadDataFromForm(formContainerElement);
              console.log(`${logPrefix} hubspot:onFormSubmit:set-pending-from-dom`, pendingLeadDataRef.current);
            }
          },
          onBeforeFormSubmit: (_form, submissionValues) => {
            console.log(`${logPrefix} hubspot:onBeforeFormSubmit`, submissionValues);
            pendingLeadDataRef.current =
              mapHubSpotSubmissionToLeadData(submissionValues);
            console.log(`${logPrefix} hubspot:onBeforeFormSubmit:set-pending`, pendingLeadDataRef.current);
          },
          onFormSubmitted: () => {
            console.log(`${logPrefix} hubspot:onFormSubmitted`);
            triggerDownload();
          },
        });
        console.log(`${logPrefix} createForm:called`);
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

      retryTimeoutId = window.setTimeout(verifyFormRendered, 1000);
    };

    const handleScriptReady = () => {
      if (isCancelled) {
        return;
      }

      console.log(`${logPrefix} script:ready`);
      createForm();
    };

    setIsFormLoading(true);
    setFormLoadError(null);
    cleanupContainer();

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${HUBSPOT_SCRIPT_SRC}"]`
    );

    if (window.hbspt?.forms?.create) {
      console.log(`${logPrefix} script:using-existing-api`);
      handleScriptReady();
    } else if (existingScript) {
      scriptElementUsed = existingScript;
      scriptLoadHandler = () => {
        console.log(`${logPrefix} script:loaded-existing-tag`);
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

        console.log(`${logPrefix} script:error`);
        setIsFormLoading(false);
        setFormLoadError("The HubSpot form could not be loaded.");
      };
      document.body.appendChild(script);
      scriptElementUsed = script;
      console.log(`${logPrefix} script:appended`);
    }

    return () => {
      isCancelled = true;

      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }

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
      observer?.disconnect();
      renderedFormElement?.removeEventListener("submit", handleNativeSubmit);
      renderedSubmitButtonElement?.removeEventListener("click", handleSubmitButtonClick);

      cleanupContainer();
      setIsFormLoading(false);
      setFormLoadError(null);
      pendingLeadDataRef.current = null;
      hasTriggeredDownloadRef.current = false;
    };
  }, [onOpenChange, onSubmit, open, formContainerElement]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] overflow-hidden rounded-[24px] border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur">
        <DialogTitle className="sr-only">
          Download your personalized compliance cost report
        </DialogTitle>
        <DialogDescription className="sr-only">
          Complete the HubSpot form to download your personalized compliance cost report.
        </DialogDescription>
        <div className="flex flex-col gap-8 p-8 sm:p-10">
          <div className="relative">
            <div
              id="hubspot-lead-form"
              ref={(node) => {
                formContainerRef.current = node;
                setFormContainerElement(node);
              }}
              className="hubspot-form-container min-h-[360px]"
            />

            {isFormLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[24px] bg-background/85 backdrop-blur-sm">
                <Spinner className="size-8 text-primary" />
                <p className="text-sm text-muted-foreground">Loading form...</p>
              </div>
            )}
          </div>

          {formLoadError && (
            <p className="text-sm text-destructive">{formLoadError}</p>
          )}

          <p className="text-xs text-muted-foreground">
            We respect your privacy and will never share your information with third parties.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
