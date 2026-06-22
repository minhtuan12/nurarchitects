export const visibleStatuses = ["draft", "published"] as const;
export const buildPlans = ["home", "businessHome", "villa", "office", "others"] as const;
export const contactFormStatuses = ["new", "contacted", "processed"] as const;
export const workingTypes = ["part-time", "full-time", "remote", "collaborator"] as const;
export const jobStatuses = ["recruiting", "closed", "expired"] as const;
export const applicationStatuses = ["new", "seen", "match", "mismatch", "contacted"] as const;
export const seoEntityTypes = ["post", "page"] as const;

export type EVisibleStatus = (typeof visibleStatuses)[number];
export type EBuildPlan = (typeof buildPlans)[number];
export type EContactFormStatus = (typeof contactFormStatuses)[number];
export type EWorkingType = (typeof workingTypes)[number];
export type EJobStatus = (typeof jobStatuses)[number];
export type EApplicationStatus = (typeof applicationStatuses)[number];
export type ESeoEntityType = (typeof seoEntityTypes)[number];
