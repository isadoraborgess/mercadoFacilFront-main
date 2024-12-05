import React, { useEffect, useState } from "react";
import { ShareProps } from "../../Interfaces/ShareProps";
import { getAcaoPorCodigo } from "../../Servicos/MercadoFacilAPI";
import AcaoDisplay from "../ShareDisplay/ShareDisplay";

const Acao: React.FC<ShareProps> = ({ symbol }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleToggleFavorite = (symbol: string) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.includes(symbol)
          ? prevFavorites.filter((fav) => fav !== symbol)
          : [...prevFavorites, symbol];

      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    const fetchData = async () => {
      try {
        const data: any = await Promise.race([
          getAcaoPorCodigo(symbol),
          new Promise((_resolve, reject) => {
            timer = setTimeout(() => {
              reject(new Error("Tempo limite excedido (5 segundos)"));
            }, 5000);
          }),
        ]);

        clearTimeout(timer);

        // Verifique se o status da resposta é 204 ou se o JSON está vazio
        if (!data || Object.keys(data).length === 0) {
          setError("Ação não encontrada");
        } else {
          setData(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => clearTimeout(timer);
  }, [symbol]);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
          <span className="text-lg text-gray-500">Loading ...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-full">
          <span className="text-lg text-red-500">{error}</span>
        </div>
    );
  }

  return (
      <div className="p-4 rounded-lg shadow-md">
        <AcaoDisplay
            logourl={data?.logourl}
            symbol={data?.symbol}
            shortName={data?.shortName}
            currency={data?.currency}
            regularMarketPrice={data?.regularMarketPrice}
            regularMarketDayRange={data?.regularMarketDayRange}
            regularMarketDayHigh={data?.regularMarketDayHigh}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.includes(data.symbol)}
        />
      </div>
  );
};

export default Acao;