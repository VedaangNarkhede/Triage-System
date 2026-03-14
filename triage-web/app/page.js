import Link from "next/link";
import { FaHeartbeat, FaClinicMedical, FaStethoscope, FaBriefcaseMedical } from "react-icons/fa";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-brand-primary text-white py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              WE PROVIDE BEST<br />HEALTHCARE
            </h1>
            <p className="text-brand-accent mb-8 max-w-md">
              Our AI-powered intelligent triage assistant helps convert unstructured patient information into structured summaries to improve workflow efficiency.
            </p>
            <Link 
              href="/patient/new" 
              className="bg-white text-brand-primary font-bold py-3 px-8 rounded shadow-lg hover:bg-gray-100 transition-colors inline-block"
            >
              Start Triage
            </Link>
          </div>
          {/* Decorative Circle Background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        </div>
        
        {/* Curvy Bottom Division */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 translate-y-[1px]">
          <svg className="w-full h-16 md:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z" className="fill-brand-light"></path>
          </svg>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 px-6 bg-brand-light text-center">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-brand-dark mb-4">OUR DEPARTMENTS</h2>
          <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
            Organizing critical information across various healthcare disciplines quickly and accurately.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <DepartmentCard icon={<FaHeartbeat />} title="CARDIOLOGY" />
            <DepartmentCard icon={<FaClinicMedical />} title="DIAGNOSIS" />
            <DepartmentCard icon={<FaStethoscope />} title="SURGERY" />
            <DepartmentCard icon={<FaBriefcaseMedical />} title="FIRST AID" />
          </div>

          <div className="mt-12">
            <Link href="/doctor/dashboard" className="bg-brand-primary text-white py-2 px-8 rounded font-medium hover:bg-brand-secondary transition">
              View All Cases
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function DepartmentCard({ icon, title }) {
  return (
    <div className="flex flex-col items-center group cursor-default">
      <div className="w-20 h-20 rounded-full border-2 border-brand-accent flex items-center justify-center text-3xl text-brand-primary mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-brand-dark mb-2">{title}</h3>
      <p className="text-xs text-gray-500 px-4">
        AI-assisted structured summaries for enhanced prioritization.
      </p>
    </div>
  );
}
