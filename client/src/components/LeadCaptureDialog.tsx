import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrivacyPolicy from "@/components/PrivacyPolicy";

declare global {
  interface Window {
    hbspt?: {
      forms?: {
        create: (options: {
          region: string;
          portalId: string;
          formId: string;
          target: string;
        }) => void;
      };
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

export default function LeadCaptureDialog({
  open,
  onOpenChange,
  onSubmit: _onSubmit,
}: LeadCaptureDialogProps) {
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const [formContainerElement, setFormContainerElement] = useState<HTMLDivElement | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formLoadError, setFormLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !formContainerElement) {
      return;
    }

    let isCancelled = false;
    let retryTimeoutId: number | null = null;
    let attempts = 0;

    setIsFormLoading(true);
    setFormLoadError(null);
    formContainerElement.innerHTML = "";

    const verifyFormRendered = () => {
      if (isCancelled) {
        return;
      }

      const hasRenderedForm = Boolean(
        formContainerElement.querySelector("iframe, form, .hs-form")
      );

      setIsFormLoading(false);

      if (!hasRenderedForm) {
        setFormLoadError("The HubSpot form rendered empty.");
      }
    };

    const createForm = () => {
      if (isCancelled) {
        return;
      }

      if (!window.hbspt?.forms?.create) {
        attempts += 1;

        if (attempts >= 20) {
          setIsFormLoading(false);
          setFormLoadError("The HubSpot form could not be initialized.");
          return;
        }

        retryTimeoutId = window.setTimeout(createForm, 250);
        return;
      }

      formContainerElement.innerHTML = "";

      try {
        window.hbspt.forms.create({
          region: "na2",
          portalId: "5861764",
          formId: "4ff11aed-2ca9-4d59-89a1-40aa24204eb0",
          target: "#hubspot-lead-form",
        });
      } catch (error) {
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
      try {
        createForm();
      } catch (error) {
        setIsFormLoading(false);
        setFormLoadError(
          error instanceof Error
            ? `The HubSpot form could not be initialized: ${error.message}`
            : "The HubSpot form could not be initialized."
        );
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://js-na2.hsforms.net/forms/v2.js"]'
    );

    if (existingScript) {
      handleScriptReady();
    } else {
      const script = document.createElement("script");
      script.src = "https://js-na2.hsforms.net/forms/v2.js";
      script.async = true;
      script.defer = true;
      script.onload = handleScriptReady;
      script.onerror = () => {
        setIsFormLoading(false);
        setFormLoadError("The HubSpot form could not be loaded.");
      };
      document.body.appendChild(script);
    }

    return () => {
      isCancelled = true;

      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }

      formContainerElement.innerHTML = "";

      setIsFormLoading(false);
      setFormLoadError(null);
    };
  }, [open, formContainerElement]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Get Your Personalized Compliance Cost Analysis
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-base space-y-2">
              <p>You've done the work. Now get your full analysis in a format you can share with your leadership team or use in client conversations.</p>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                <strong>Privacy Notice:</strong> A BCS strategist will follow up within 2 business days to walk through your results and answer any questions. View our <PrivacyPolicy asLink /> for details.
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div
          id="hubspot-lead-form"
          ref={(node) => {
            formContainerRef.current = node;
            setFormContainerElement(node);
          }}
          className="mt-4 min-h-[320px]"
        />
        {isFormLoading && (
          <p className="mt-4 text-sm text-muted-foreground">
            Loading form...
          </p>
        )}
        {formLoadError && (
          <p className="mt-4 text-sm text-destructive">
            {formLoadError}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
