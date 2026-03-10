export type HubSpotFieldValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | null
  | undefined;

export interface HubSpotSubmissionField {
  name: string;
  value: HubSpotFieldValue;
}

export interface LeadDataLike {
  name: string;
  email: string;
  company: string;
  phone: string;
}

export function normalizeSubmissionFieldName(name: string) {
  const normalizedName = name.toLowerCase().trim();
  return normalizedName.split("/").pop() ?? normalizedName;
}

export function normalizeSubmissionFieldValue(value: HubSpotFieldValue) {
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

export function getSubmissionValue(
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

export function mapHubSpotSubmissionToLeadData(
  submissionValues: HubSpotSubmissionField[]
): LeadDataLike {
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

export function readLeadDataFromForm(container: HTMLDivElement): LeadDataLike {
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
