import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
          <p className="text-sm text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="gradient-primary text-primary-foreground w-full">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/chat">
              Try Our Chat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
