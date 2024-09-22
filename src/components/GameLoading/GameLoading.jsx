function GameLoading() {
  return (
    <div className="absolute bottom-1/2 right-1/2 mb-4 flex translate-x-1/2 translate-y-1/2 transform flex-col items-center justify-center">
      <div className="items-center justify-center"></div>
      <div className="relative mt-4 text-4xl font-bold text-white">
        Loading Game . . .
        <div className="absolute -right-20 -top-2 h-16 w-16 rounded-full border-8 border-solid border-gray-300"></div>
        <div className="absolute -right-20 -top-2 h-16 w-16 animate-spin rounded-full border-8 border-solid border-punch-red border-t-transparent shadow-md"></div>
      </div>
    </div>
  );
}

export default GameLoading;
