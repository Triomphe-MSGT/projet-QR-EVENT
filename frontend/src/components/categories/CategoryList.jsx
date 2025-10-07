import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import axios from "axios";

const fetchCategories = async () => {
  const res = await axios.get("http://localhost:3000/categories");
  return res.data;
};

export default function ListCategorie() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) return <p>Chargement...</p>;
  if (isError) return <p>Erreur lors du chargement.</p>;

  const bgColors = [
    "bg-blue-300",
    "bg-pink-300",
    "bg-yellow-300",
    "bg-purple-300",
    "bg-green-300",
    "bg-gray-300",
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6">
      {data.map((cat, idx) => (
        <Link
          key={cat.id}
          to={`/categories/${cat.name}`}
          className={`flex flex-col items-center justify-center ${
            bgColors[idx % bgColors.length]
          } 
                     rounded-2xl shadow-md h-32 hover:shadow-lg hover:scale-105 transition-transform`}
        >
          <span className="text-4xl">{cat.emoji}</span>
          <p className="mt-2 font-bold text-white">{cat.name}</p>
        </Link>
      ))}
    </div>
  );
}
