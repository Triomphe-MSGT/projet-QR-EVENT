const SearchAndFilter = ({
  query,
  setQuery,
  isFilterOpen,
  setIsFilterOpen,
  selectedCity,
  setSelectedCity,
  setCurrentPage,
}) => {
  return (
    <div className="container mx-auto px-4 sm:px-0">
      {/* Barre de recherche + filtre */}
      <div className="mb-4 flex items-center relative">
        <div className="relative flex-grow mr-2 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#3E4042] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors duration-300">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400 dark:text-[#B0B3B8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#3A3B3C] text-gray-800 dark:text-[#E4E6EB] placeholder-gray-400 dark:placeholder-[#B0B3B8] focus:outline-none rounded-xl transition-colors duration-300"
          />
        </div>

        {/* Bouton filtre */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-gray-200 dark:bg-[#3A3B3C] rounded-xl text-gray-700 dark:text-[#E4E6EB] font-semibold hover:bg-gray-300 dark:hover:bg-[#4E4F50] transition-colors duration-200"
          >
            Filtre
          </button>

          {/* Dropdown filtre */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#3A3B3C] rounded-lg shadow-lg dark:shadow-none z-10 border border-gray-200 dark:border-[#3E4042] transition-colors duration-300">
              <div className="p-4 space-y-4">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-[#E4E6EB] mb-2">
                    Ville
                  </p>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-[#3E4042] rounded-md bg-white dark:bg-[#3A3B3C] text-gray-800 dark:text-[#E4E6EB] transition-colors duration-300"
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option>Toutes</option>
                    <option>Garoua</option>
                    <option>Bamenda</option>
                    <option>Bafoussam</option>
                    <option>Maroua</option>
                    <option>Ngaoundéré</option>
                    <option>Nkongsamba</option>
                    <option>Kumba</option>
                    <option>Édéa</option>
                    <option>Loum</option>
                    <option>Dschang</option>
                    <option>Foumban</option>
                    <option>Mbouda</option>
                    <option>Limbé</option>
                    <option>Ébolowa</option>
                    <option>Kousséri</option>
                    <option>Tiko</option>
                    <option>Bafang</option>
                    <option>Mbalmayo</option>
                    <option>Guider</option>
                    <option>Yagoua</option>
                    <option>Bafia</option>
                    <option>Buéa</option>
                    <option>Kumbo</option>
                    <option>Sangmélima</option>
                    <option>Batouri</option>
                    <option>Mokolo</option>
                    <option>Meïganga</option>
                    <option>Mora</option>
                    <option>Wum</option>
                    <option>Bangangté</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
