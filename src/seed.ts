import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedEntry {
  url: string;
  tags: {
    state?: string;
    aggregator_name?: string;
    url_type: string;
  };
  intervalMinutes?: number;
}

const SEED_URLS: SeedEntry[] = [
  // ==================================================================
  //  HHAeXchange — Top-level / corporate pages
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/solutions/providers/electronic-visit-verification",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/state-evv-status",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/state-medicaid-programs",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/state-medicaid-programs/medicaid-business-intelligence",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/self-direction",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/mco",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/providers",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/platform",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/partner-connect",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/info-hub",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/consumer-info-hub",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },

  // ==================================================================
  //  HHAeXchange — Provider state info hubs (one per state)
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/alabama",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/arkansas",
    tags: { state: "AR", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/florida",
    tags: { state: "FL", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/hawaii",
    tags: { state: "HI", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/illinois",
    tags: { state: "IL", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/michigan",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/minnesota",
    tags: { state: "MN", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/mississippi",
    tags: { state: "MS", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/new-jersey",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/new-york",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/north-carolina",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/oklahoma",
    tags: { state: "OK", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/pennsylvania",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/texas",
    tags: { state: "TX", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/virginia",
    tags: { state: "VA", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/west-virginia",
    tags: { state: "WV", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  HHAeXchange — Individual provider / payer info hubs (per state)
  // ==================================================================

  // Alabama
  {
    url: "https://www.hhaexchange.com/info-hub/alabama",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Arkansas
  {
    url: "https://www.hhaexchange.com/info-hub/arkansas-state-medicaid-passe",
    tags: { state: "AR", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Florida
  {
    url: "https://www.hhaexchange.com/info-hub/florida",
    tags: { state: "FL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Hawaii
  {
    url: "https://www.hhaexchange.com/info-hub/ohana-hp",
    tags: { state: "HI", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Illinois
  {
    url: "https://www.hhaexchange.com/info-hub/illinois",
    tags: { state: "IL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/illinois-doa-drs",
    tags: { state: "IL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Michigan
  {
    url: "https://www.hhaexchange.com/info-hub/michigan-information-center",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/meridian-michigan",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Minnesota
  {
    url: "https://www.hhaexchange.com/info-hub/minnesota",
    tags: { state: "MN", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Mississippi
  {
    url: "https://www.hhaexchange.com/info-hub/mississippi",
    tags: { state: "MS", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // New Jersey
  {
    url: "https://www.hhaexchange.com/info-hub/new-jersey-csoc",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/new-jersey-dmahs-personal-care-services",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/new-jersey-home-health",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // New York
  {
    url: "https://www.hhaexchange.com/info-hub/aetna-better-health-of-ny",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/centerlight-healthcare-pace-of-new-york",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/elderplan-homefirst",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/fidelis-care",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/healthfirst",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/molina-healthcare-of-new-york-inc",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/nascentia-health",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/riverspring-health-plans",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/senior-whole-health",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/unitedhealthcare-community-plan-of-ny",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/visiting-nurse-service-of-new-york",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // North Carolina
  {
    url: "https://www.hhaexchange.com/info-hub/north-carolina-home-health",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/north-carolina-php",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/north-carolina-tailored-plan",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Oklahoma
  {
    url: "https://www.hhaexchange.com/info-hub/oklahoma",
    tags: { state: "OK", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Pennsylvania
  {
    url: "https://www.hhaexchange.com/info-hub/pennsylvania-community-healthchoices",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/pennsylvania-epsdt",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/pennsylvania-home-health",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Texas
  {
    url: "https://www.hhaexchange.com/info-hub/texas",
    tags: { state: "TX", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/consumer-info-hub/texas-health-and-human-services",
    tags: { state: "TX", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },

  // Virginia
  {
    url: "https://www.hhaexchange.com/info-hub/humana-virginia",
    tags: { state: "VA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // West Virginia
  {
    url: "https://www.hhaexchange.com/info-hub/west-virginia",
    tags: { state: "WV", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  HHAeXchange — Press releases (state aggregator announcements)
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/press-releases/hhaexchange-selected-by-the-state-of-michigan-as-evv-aggregator",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },
  {
    url: "https://www.hhaexchange.com/press-releases/alabama-selects-hhaexchange-for-evv",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },

  // ==================================================================
  //  HHAeXchange — Blog / resources / EVV content
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/blog/topic/evv",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },
  {
    url: "https://www.hhaexchange.com/resources",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },

  // ==================================================================
  //  Confluence-sourced: State Government EVV Portals
  // ==================================================================
  {
    url: "https://www.azahcccs.gov/AHCCCS/Initiatives/EVV/",
    tags: { state: "AZ", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.azahcccs.gov/AHCCCS/Downloads/EVV/AddendumAZALTEVV.pdf",
    tags: { state: "AZ", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://humanservices.arkansas.gov/divisions-shared-services/medical-services/healthcare-programs/electronic-visit-verification/",
    tags: { state: "AR", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.dhcs.ca.gov/provgovpart/Documents/EVV-Provider-Types-and-Codes-November.pdf",
    tags: { state: "CA", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://portal.ct.gov/DSS/Health-And-Home-Care/Electronic-Visit-Verification/Electronic-Visit-Verification",
    tags: { state: "CT", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://portal.ct.gov/DSS/Health-And-Home-Care/Electronic-Visit-Verification/Electronic-Visit-Verification/Documents",
    tags: { state: "CT", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://dhss.delaware.gov/dmma/info_stats.html",
    tags: { state: "DE", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://dhss.delaware.gov/dmma/files/evv_systemaatestation.pdf",
    tags: { state: "DE", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://dhss.delaware.gov/dmma/files/evv_vendorchangeform.pdf",
    tags: { state: "DE", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://medquest.hawaii.gov/en/plans-providers/evv.html",
    tags: { state: "HI", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://portal.kmap-state-ks.us/PublicPage",
    tags: { state: "KS", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.mass.gov/service-details/data-aggregator-for-asap-contracted-providers",
    tags: { state: "MA", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.mass.gov/info-details/learn-about-evv-for-provider-organizations-that-contract-with-sco-or-one-care-plans",
    tags: { state: "MA", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://dphhs.mt.gov/sltc/EVV",
    tags: { state: "MT", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://dphhs.mt.gov/assets/sltc/EVV/ServicesSubjecttoEVV.pdf",
    tags: { state: "MT", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://www.dhhs.nh.gov/programs-services/medicaid/electronic-visit-verification",
    tags: { state: "NH", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.emedny.org/evv/",
    tags: { state: "NY", aggregator_name: "eMedNY", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.emedny.org/info/ProviderEnrollment/",
    tags: { state: "NY", aggregator_name: "eMedNY", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.emedny.org/portal",
    tags: { state: "NY", aggregator_name: "eMedNY", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhs.nd.gov/healthcare/electronic-visit-verification",
    tags: { state: "ND", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.dhs.pa.gov/providers/Providers/Pages/Statewide-Managed-Care-Map.aspx",
    tags: { state: "PA", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.scdhhs.gov/press-release/electronic-visit-verification-evv",
    tags: { state: "SC", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.tmhp.com/programs/electronic-visit-verification",
    tags: { state: "TX", aggregator_name: "TMHP", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.tmhp.com/sites/default/files/file-library/evv/evv-proprietary-systems/hhsc-evv-business-rules-proprietary-systems-2/Appendix_A_EVV_Reason_Codes_Effective_Aug_1_2023.pdf",
    tags: { state: "TX", aggregator_name: "TMHP", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://www.tmhp.com/sites/default/files/file-library/evv/evv-proprietary-systems/hhsc-evv-business-rules-proprietary-systems-2/Appendix_P_Auto_Verification_V4.0.pdf",
    tags: { state: "TX", aggregator_name: "TMHP", url_type: "spec_doc" },
    intervalMinutes: 240,
  },

  // ==================================================================
  //  Confluence-sourced: HHAeXchange — additional portals & docs
  // ==================================================================
  {
    url: "https://hhaexchange.com/alabama/",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://hhaexchange.com/ar/",
    tags: { state: "AR", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://hhaexchange.com/fideliscare/",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://hhaexchange.com/nj-home-health/",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://hhaexchange.com/ohana-2/",
    tags: { state: "HI", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://hhaexchange.com/wvhomehealth/",
    tags: { state: "WV", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://hhaexchange.my.site.com/s/",
    tags: { aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://knowledge.hhaexchange.com/EDI/Content/Documentation/EDI/API.htm",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://knowledge.hhaexchange.com/EDI/Content/Documentation/EDI/EDI.htm",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://knowledge.hhaexchange.com/EDI/Content/Documentation/EDI/EDI-Homecare-Import-P.htm",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "http://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI%20Guides/EVV%20Aggregation/AL/AL_Electronic%20Visit%20Verification%20(EVV)%20Data%20Aggregator%20API%20Specification.pdf",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "http://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI%20Guides/EVV%20Aggregation/AL/AL_EVV_Data_Aggregation_Business_Requirements.pdf",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/ENTF/AL/EDI+Provider+Welcome+Letter_AL.pdf",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "http://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI%20Guides/EDI%20Guides_v5/Homecare_Provider_Integration_Visit_Import_Guide_v5.pdf",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/EDI+Code+Table+Guides/EDI+Code+Table+Guide_AR.pdf",
    tags: { state: "AR", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/Provider+Job+Aid+-+Provider+File+Validation+Errors.pdf",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/EDI+Code+Table+Guides/EDI+Code+Table+Guide_Wellcare+HI+BH_HI.pdf",
    tags: { state: "HI", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/EVV+Aggregation/WV/HHAX+EVV+API+Technical+Specifications_WV.pdf",
    tags: { state: "WV", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/EDI+Code+Table+Guides/EDI+Code+Table+Guide_Fidelis.pdf",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/ENTF/NY/Fidelis/FidelisCare+EDI+Welcome+Packet.pdf",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/EVV+Aggregation/NJ/HHAX+EVV+API+Technical+Specifications_NJ.pdf",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI%20Guides/EDI%20Code%20Table%20Guides/EDI%20Code%20Table%20Guide_Molina_NY.pdf",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI%20Guides/EVV%20Aggregation/MI/HHAX%20EVV%20API%20Technical%20Specifications_MI.pdf",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/EDI+Code+Table+Guides/EDI+Code+Table+Guide_NC-PHP.pdf",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://hhaxsupport.s3.amazonaws.com/SupportDocs/EDI+Guides/EDI+Code+Table+Guides/EDI+Code+Table+Guide_NC.pdf",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://s3.amazonaws.com/hhaxsupport/SupportDocs/EDI+Guides/Provider+Job+Aid+-+Common+EDI+Rejections.pdf",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
    intervalMinutes: 240,
  },

  // ==================================================================
  //  Confluence-sourced: CareBridge
  // ==================================================================
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/360052099574-Iowa",
    tags: { state: "IA", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/1500002758601-North-Carolina",
    tags: { state: "NC", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/9484304612759-Tennessee",
    tags: { state: "TN", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://support.carebridgehealth.com/hc/en-us/articles/9484304612759-Tennessee",
    tags: { state: "TN", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/360052858033-New-York",
    tags: { state: "NY", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/360052857833-New-Jersey",
    tags: { state: "NJ", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/360052099734-Arkansas",
    tags: { state: "AR", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/360052858053-Wyoming",
    tags: { state: "WY", aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://evvintegrationeform.carebridgehealth.com",
    tags: { aggregator_name: "CareBridge", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/1500002275521-Integrating-Agency-CareBridge-Portal-Access-Request",
    tags: { aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/sections/1500002102322-Resources-for-Integrated-Agencies",
    tags: { aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/4411343452567-Pre-Billing-Validations",
    tags: { aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/360060828454-Pre-Billing-Validation-Report",
    tags: { aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/1500000864922-Third-Party-EVV-Vendor-Integration-FAQs",
    tags: { aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/sections/1500002119841-Additional-Documents-for-Third-Party-Vendors",
    tags: { aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/9484694240151-Tennessee-Third-Party-EVV-Vendor-Integration-Testing-Process-Guide",
    tags: { state: "TN", aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/7485814332567-New-Jersey-Third-Party-EVV-Vendor-Integration-Testing-Process-Guide",
    tags: { state: "NJ", aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/en-us/articles/4414493361175-Arkansas-Third-Party-EVV-Vendor-Integration-Testing-Process-Guide",
    tags: { state: "AR", aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/article_attachments/4413549726615/CareBridge_Testing_Checklist_V1.0_18NOV2021.pdf",
    tags: { aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://carebridgehealth.zendesk.com/hc/article_attachments/7603889477015/CareBridge_Testing_Process_Guide_IA_V1.0_19JUL2022.pdf",
    tags: { state: "IA", aggregator_name: "CareBridge", url_type: "spec_doc" },
    intervalMinutes: 240,
  },

  // ==================================================================
  //  Confluence-sourced: Netsmart / Mobile Caregiver Plus
  // ==================================================================
  {
    url: "https://mobilecaregiverplus.com/mt-dphhs/",
    tags: { state: "MT", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/training/",
    tags: { aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/florida/",
    tags: { state: "FL", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/georgia/",
    tags: { state: "GA", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/kentucky/",
    tags: { state: "KY", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/montana/",
    tags: { state: "MT", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/nebraska/",
    tags: { state: "NE", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/pennsylvania/",
    tags: { state: "PA", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/virginia/",
    tags: { state: "VA", aggregator_name: "Netsmart", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://mobilecaregiverplus.com/wp-content/uploads/2023/06/Netsmart-Alternate-EVV-Vendor-Implementation-Guide-MT-20230622.pdf",
    tags: { state: "MT", aggregator_name: "Netsmart", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://mobilecaregiverplus.com/wp-content/uploads/2023/07/Netsmart-Alternate-EVV-Vendor-Quick-Reference-Guide-MT-20230711.pdf",
    tags: { state: "MT", aggregator_name: "Netsmart", url_type: "spec_doc" },
    intervalMinutes: 240,
  },
  {
    url: "https://tellusolutions.atlassian.net/wiki/spaces/EVV/pages/591527967/Type+Code+Enumeration+Listing+for+all+Messages",
    tags: { aggregator_name: "Netsmart/Tellus", url_type: "spec_doc" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  Confluence-sourced: Sandata
  // ==================================================================
  {
    url: "https://evv-registration.sandata.com/",
    tags: { aggregator_name: "Sandata", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://sandata.zendesk.com/hc/en-us",
    tags: { aggregator_name: "Sandata", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://sandata.zendesk.com/hc/en-us/articles/5161321184275-Ohio-ODM-Vendor-Solutions-Specifications-v3-7",
    tags: { state: "OH", aggregator_name: "Sandata", url_type: "spec_doc" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.sandatalearn.com/sign_up",
    tags: { aggregator_name: "Sandata", url_type: "portal" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  Confluence-sourced: Therap
  // ==================================================================
  {
    url: "https://help.therapservices.net",
    tags: { state: "AK", aggregator_name: "Therap", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.therapservices.net",
    tags: { state: "KY", aggregator_name: "Therap", url_type: "portal" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  Other aggregators / vendors
  // ==================================================================
  {
    url: "https://www.sandata.com/evv",
    tags: { aggregator_name: "Sandata", url_type: "aggregator" },
  },
  {
    url: "https://www.sandata.com/electronic-visit-verification",
    tags: { aggregator_name: "Sandata", url_type: "aggregator" },
  },
  {
    url: "https://www.ntst.com/Solutions/Electronic-Visit-Verification",
    tags: { aggregator_name: "Netsmart/AuthentiCare", url_type: "aggregator" },
  },
  {
    url: "https://www.tellus.com/evv",
    tags: { aggregator_name: "Tellus", url_type: "aggregator" },
  },

  // ==================================================================
  //  State Medicaid EVV portals (non-HHAeXchange)
  // ==================================================================
  {
    url: "https://www.hhs.texas.gov/providers/long-term-care-providers/electronic-visit-verification",
    tags: { state: "TX", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://medicaid.ohio.gov/resources-for-providers/special-programs/evv",
    tags: { state: "OH", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://ahca.myflorida.com/medicaid/Policy_and_Quality/Policy/program_policy/electronic-visit-verification",
    tags: { state: "FL", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.health.ny.gov/health_care/medicaid/program/evv/",
    tags: { state: "NY", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.illinois.gov/hfs/MedicalProviders/ElectronicVisitVerification",
    tags: { state: "IL", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.dhcs.ca.gov/provgovpart/Pages/EVV.aspx",
    tags: { state: "CA", url_type: "portal" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  Federal / CURES Act reference
  // ==================================================================
  {
    url: "https://www.medicaid.gov/medicaid/home-community-based-services/electronic-visit-verification/index.html",
    tags: { url_type: "portal", state: "Federal" },
    intervalMinutes: 240,
  },
];

async function seed(): Promise<void> {
  console.log("Seeding watchlist...");

  let created = 0;
  let skipped = 0;

  for (const entry of SEED_URLS) {
    const existing = await prisma.watchedUrl.findUnique({
      where: { url: entry.url },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.watchedUrl.create({
      data: {
        url: entry.url,
        source: "manual",
        status: "active",
        intervalMinutes: entry.intervalMinutes ?? 60,
        tags: JSON.stringify(entry.tags),
      },
    });
    created++;
  }

  console.log(`Seed complete: ${created} created, ${skipped} already existed`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
