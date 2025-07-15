{/* Main Heading */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  🛡️ UAE's Most Trusted Scam Protection Platform
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Stop Visa Fraudsters
                </span>
                <br />
                <span className="text-gray-900">Before They Strike</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                🛡️ Expose scammers, protect your money, and save others from
                fraud. Access verified company reviews, report suspicious
                activities, and join thousands protecting the UAE immigration
                community.
              </p>
            </div>

            {/* Search Bar with Autocomplete */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                {/* Desktop Search */}
                <div className="hidden md:block">
                  <Input
                    type="text"
                    placeholder="Search companies, report scams, or check reviews..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    onFocus={() =>
                      searchTerm.length >= 3 && setShowSuggestions(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    className="h-16 pl-6 pr-32 text-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-blue-400 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                  />
                  <Button
                    onClick={() => navigate("/complaint")}
                    size="lg"
                    className="absolute right-2 top-2 h-12 px-8 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Report
                  </Button>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search or report scams..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      onFocus={() =>
                        searchTerm.length >= 3 && setShowSuggestions(true)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                      className="h-14 px-4 text-base bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-xl"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={() => navigate("/complaint")}
                      size="lg"
                      className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg text-white font-semibold"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Check Company Safety
                    </Button>
                    <Button
                      onClick={handleSearch}
                      size="lg"
                      variant="outline"
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-lg px-8 py-3 rounded-xl font-semibold"
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      Browse Verified Companies
                    </Button>
                  </div>
                </div>