function NotFound() {
  return (
    <main className="flex h-screen items-center justify-center bg-black px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-4xl font-semibold text-punch-red">404</p>
        <h1 className="mt-4 text-6xl font-bold tracking-tight text-white sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-2xl leading-7 text-white">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            className="w-40 rounded-lg bg-punch-red p-2 text-xl font-bold text-white"
          >
            Back to Title
          </a>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
