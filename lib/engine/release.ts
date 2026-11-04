export type V11Acceptance={unitTests:boolean;desktopBrowser:boolean;mobileBrowser:boolean;visualReview:boolean;scientificApproval:boolean;isolatedBackend:boolean;authAndSync:boolean;rlsAndScoring:boolean};
export const V11_ACCEPTANCE_PENDING:V11Acceptance={unitTests:false,desktopBrowser:false,mobileBrowser:false,visualReview:false,scientificApproval:false,isolatedBackend:false,authAndSync:false,rlsAndScoring:false};
export function canStartV12(gates:V11Acceptance){return Object.values(gates).every(v=>v===true)}
export const V12_SCOPE=['General Questions','Verified Ministerial Exams','Clinical Cases'] as const;
