import React from "react";
import { Shield } from "lucide-react";

export default function GovernmentSection() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Government Authorized Services
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
            All listed visa services are registered and comply with UAE
            government regulations and Dubai municipality standards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* UAE Government */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-red-500 via-white to-green-600 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-red-600">
                  UAE
                </span>
              </div>
            </div>
            <div className="text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                UAE Government
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm">
                Federal Authority for Identity & Citizenship
              </p>
              <p className="text-blue-200 text-xs mt-1">www.government.ae</p>
            </div>
          </div>

          {/* Dubai Municipality */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-white">
                  DM
                </span>
              </div>
            </div>
            <div className="text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Dubai Municipality
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm">
                Business Registration & Licensing Authority
              </p>
              <p className="text-blue-200 text-xs mt-1">www.dm.gov.ae</p>
            </div>
          </div>

          {/* Immigration Department */}
          <div className="text-center space-y-4 sm:col-span-2 md:col-span-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-white">
                  ID
                </span>
              </div>
            </div>
            <div className="text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Immigration Dept
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm">
                General Directorate of Residency & Foreign Affairs
              </p>
              <p className="text-blue-200 text-xs mt-1">www.gdrfad.gov.ae</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Compliance Guarantee
            </h3>
          </div>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
            Every visa service listed on our platform is verified to hold valid
            trade licenses and comply with UAE federal laws and Dubai local
            regulations for immigration services.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs sm:text-sm">
            <div className="text-blue-200">
              <div className="font-semibold text-white text-lg sm:text-xl">
                150+
              </div>
              <div>Licensed Services</div>
            </div>
            <div className="text-blue-200">
              <div className="font-semibold text-white text-lg sm:text-xl">
                100%
              </div>
              <div>Government Compliant</div>
            </div>
            <div className="text-blue-200">
              <div className="font-semibold text-white text-lg sm:text-xl">
                24/7
              </div>
              <div>Support Available</div>
            </div>
            <div className="text-blue-200">
              <div className="font-semibold text-white text-lg sm:text-xl">
                99%
              </div>
              <div>Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
