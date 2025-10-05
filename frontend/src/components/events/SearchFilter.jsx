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
        {/* Champ de recherche */}
        <div className="relative flex-grow mr-2 rounded-xl overflow-hidden shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
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
            className="w-full pl-10 pr-4 py-2"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1); // reset pagination
            }}
          />
        </div>

        {/* Bouton filtre */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-300 transition-colors duration-200"
          >
            Filtre
          </button>

          {/* Dropdown filtre */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
              <div className="p-4 space-y-4">
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Ville</p>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCurrentPage(1); // reset pagination
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
