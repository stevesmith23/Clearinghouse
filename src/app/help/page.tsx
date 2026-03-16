import { HelpCircle, ExternalLink, FileText, BookOpen, Shield, Users, Building2, Stethoscope, GraduationCap, Truck } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
    await requireAuth();

    const sections = [
        {
            title: "C/TPA Resources",
            icon: Building2,
            color: "text-[#3E91DE]",
            bg: "bg-[#3E91DE]/5",
            border: "border-[#3E91DE]/20",
            description: "Resources for Consortia/Third-Party Administrators — your primary role.",
            links: [
                { label: "Brochure: Registration & Requirements for C/TPAs", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Clearinghouse-Brochure-CTPA.pdf" },
                { label: "How to Register as a C/TPA", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Registration-Instructions-CTPA.pdf" },
                { label: "How to Conduct a Limited Query (C/TPA)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Conduct-Limited-Query-CTPA.pdf" },
                { label: "How to Conduct a Full Query (C/TPA)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Conduct-Full-Query-CTPA.pdf" },
                { label: "How to Report Driver Violation (C/TPA)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Report-Violation-CTPA.pdf" },
                { label: "How to Report Driver RTD Info (C/TPA)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Report-RTD-CTPA.pdf" },
                { label: "Query History (C/TPA)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Query-History-CTPA.pdf" },
                { label: "Bulk Query Template Files", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Bulk-Query-Template-Files.zip" },
            ],
        },
        {
            title: "Employer Resources",
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-200",
            description: "Share these with your client companies as needed.",
            links: [
                { label: "Brochure: Requirements for Employers", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Clearinghouse-Brochure-Employer.pdf" },
                { label: "How to Register: Employers With Portal", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Registration-Instructions-Employer-With-Portal.pdf" },
                { label: "How to Register: Employers Without Portal", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Registration-Instructions-Employer-Without-Portal.pdf" },
                { label: "How to Designate Your C/TPA", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Designate-CTPA.pdf" },
                { label: "How to Purchase a Query Plan", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Purchase-Query-Plan.pdf" },
                { label: "Query Plan Details", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Query-Plan-Factsheet.pdf" },
                { label: "Sample Limited Consent Request Form", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Clearinghouse_Sample_Limited_Consent_Form.pdf" },
                { label: "Queries and Consent Requests Factsheet", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/Queries-and-Consent-Requests.pdf" },
            ],
        },
        {
            title: "Driver Resources",
            icon: Truck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
            description: "Resources to share with drivers who need to respond to consent requests or navigate the RTD process.",
            links: [
                { label: "Brochure: Registration for CDL Drivers", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/driver/Clearinghouse-Brochure-Driver.pdf" },
                { label: "How to Register as a CDL Driver", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/driver/Registration-Instructions-Driver.pdf" },
                { label: "How to Respond to Consent Requests", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/driver/Responding-to-Consent-Requests.pdf" },
                { label: "Completing the Return-to-Duty Process (Visor Card)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/driver/Complete-The-RTD-Process.pdf" },
                { label: "How to Designate a SAP", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/driver/Designate-SAP.pdf" },
                { label: "How to Submit a DataQs Petition", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/driver/Clearinghouse-Submit-Data-Review-Petition.pdf" },
            ],
        },
        {
            title: "Violations & RTD Process",
            icon: Shield,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
            description: "The Return-to-Duty process after a violation: SAP evaluation → treatment → follow-up eval → RTD test → cleared.",
            links: [
                { label: "Overview of the Return-to-Duty Process", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/RTD-Process-Overview.pdf" },
                { label: "How to Report Driver Violation (C/TPA)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Report-Violation-CTPA.pdf" },
                { label: "How to Report Driver Violation (Employer)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Report-Violation-Employers.pdf" },
                { label: "How to Report Driver RTD Info (C/TPA)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/CTPA/Report-RTD-CTPA.pdf" },
                { label: "How to Report Driver RTD Info (Employer)", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/employer/Report-RTD-Information-Employer.pdf" },
            ],
        },
        {
            title: "MRO & SAP Resources",
            icon: Stethoscope,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-200",
            description: "Resources for Medical Review Officers and Substance Abuse Professionals.",
            links: [
                { label: "How to Register as an MRO", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/MRO/Registration-Instructions-MRO.pdf" },
                { label: "MRO: Report Violation Information", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/MRO/Report-Violation-MRO.pdf" },
                { label: "How to Register as a SAP", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/SAP/Registration-Instructions-SAP.pdf" },
                { label: "SAP: Report Driver RTD Information", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/SAP/Report-RTD-SAP.pdf" },
            ],
        },
        {
            title: "Regulatory & General",
            icon: BookOpen,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200",
            description: "Official rules, regulations, and general FMCSA resources.",
            links: [
                { label: "FMCSA Clearinghouse Website", url: "https://clearinghouse.fmcsa.dot.gov" },
                { label: "Clearinghouse Factsheet", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/Clearinghouse-Factsheet.pdf" },
                { label: "User Roles Card", url: "https://clearinghouse.fmcsa.dot.gov/content/resources/Clearinghouse-User-Roles-Card.pdf" },
                { label: "Clearinghouse Final Rule", url: "https://www.federalregister.gov/documents/2016/12/05/2016-27398/commercial-drivers-license-drug-and-alcohol-clearinghouse" },
                { label: "Clearinghouse-II Final Rule (CDL Downgrades)", url: "https://www.regulations.gov/document/FMCSA-2017-0330-0036" },
                { label: "DOT Drug & Alcohol Testing Resources (Employers)", url: "https://www.fmcsa.dot.gov/regulations/drug-alcohol-testing/employers-resources-and-downloads" },
                { label: "DOT Drug & Alcohol Testing Resources (Drivers)", url: "https://www.fmcsa.dot.gov/regulations/drug-alcohol-testing/driver-resources-and-downloads" },
                { label: "ODAPC Website", url: "https://www.transportation.gov/odapc" },
            ],
        },
    ];

    return (
        <div className="p-8 sm:p-12 max-w-7xl mx-auto mb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[#143A82] flex items-center gap-3">
                    <HelpCircle className="w-8 h-8 text-[#3E91DE]" />
                    Help & FMCSA Resources
                </h1>
                <p className="text-[#3E91DE] mt-1">
                    Quick-reference links to official FMCSA Clearinghouse guides and PDFs, organized by role and workflow.
                </p>
            </div>

            <div className="space-y-6">
                {sections.map((section) => (
                    <div key={section.title} className={`bg-white rounded-xl border ${section.border} shadow-sm overflow-hidden`}>
                        <div className={`px-6 py-4 ${section.bg} border-b ${section.border} flex items-center gap-3`}>
                            <section.icon className={`w-5 h-5 ${section.color}`} />
                            <div>
                                <h2 className={`font-bold ${section.color}`}>{section.title}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {section.links.map((link) => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#3E91DE] transition-colors shrink-0" />
                                        <span className="text-sm text-[#143A82] group-hover:text-[#3E91DE] transition-colors">{link.label}</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#3E91DE] transition-colors shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
