import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">
                Dubai Visa Services
              </span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Dubai's trusted platform for finding verified visa services and
              protecting against immigration scams.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-base sm:text-lg">
              Services
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
              <li>
                <button
                  onClick={() => navigate("/services/work-visa")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Work Visa Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/services/tourist-visa")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Tourist Visa Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/services/student-visa")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Student Visa Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/services/business-visa")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Business Visa Services
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-base sm:text-lg">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
              <li>
                <button
                  onClick={() => navigate("/complaint")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Report Scam
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/help-center")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/dubai-businesses")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Business Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/services")}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  All Services
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-base sm:text-lg">Contact</h3>
            <div className="space-y-2 text-gray-400 text-sm sm:text-base">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+971 4 XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@dubaivisaservices.ae</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          {/* Government Logos Section */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-center text-white font-semibold mb-4 sm:mb-6 text-base sm:text-lg">
              Authorized Government Partners
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-24 h-16 sm:w-32 sm:h-24">
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-xs sm:text-sm">
                    Dubai Economy
                  </div>
                  <div className="text-blue-300 text-xs">& Tourism</div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-24 h-16 sm:w-32 sm:h-24">
                <div className="text-center">
                  <div className="text-green-400 font-bold text-xs sm:text-sm">
                    Ministry HR
                  </div>
                  <div className="text-green-300 text-xs">& Emiratisation</div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-24 h-16 sm:w-32 sm:h-24">
                <div className="text-center">
                  <div className="text-purple-400 font-bold text-xs sm:text-sm">
                    Amer
                  </div>
                  <div className="text-purple-300 text-xs">Center</div>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-24 h-16 sm:w-32 sm:h-24">
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-xs sm:text-sm">
                    Tas-heel
                  </div>
                  <div className="text-orange-300 text-xs">Services</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-xs sm:text-sm">
            <p>
              © 2024 Dubai Visa Services. All rights reserved. |
              <span className="ml-1">Licensed by Dubai Economy & Tourism</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
