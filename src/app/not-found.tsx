export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-8xl font-bold text-orange-500">404</div>
        <div>
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <a href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-medium text-white hover:bg-orange-600">
          Go Home
        </a>
      </div>
    </div>
  );
}