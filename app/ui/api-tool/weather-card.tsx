type WeatherCardProps = {
  weatherData: {
    location: {
      name: string;
      country: string;
      localtime: string;
    };
    current: {
      temp_c: number;
      condition: {
        text: string;
        code: number;
      };
    };
  };
};

export default function WeatherCard({
  weatherData,
}: WeatherCardProps) {
  const { location, current } = weatherData;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-6 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">
            {location.name}
          </h2>

          <p className="text-blue-100">
            {location.country}
          </p>

          <p className="text-xs text-blue-200 mt-1">
            {location.localtime}
          </p>
        </div>

        <div className="text-6xl">🌤️</div>
      </div>

      <div className="mt-6">
        <h1 className="text-6xl font-bold">
          {current.temp_c}°
        </h1>

        <p className="mt-2 text-xl">
          {current.condition.text}
        </p>
      </div>
    </div>
  );
}