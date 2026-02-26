import logo from "@/assets/logo.png?format=webp&quality=90";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const ringClasses = {
    sm: "w-10 h-10 border-2",
    md: "w-16 h-16 border-3",
    lg: "w-20 h-20 border-4",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Spinning ring */}
        <div 
          className={`${ringClasses[size]} absolute inset-0 m-auto rounded-full border-primary/20 border-t-primary animate-spin`}
          style={{ animationDuration: "1s" }}
        />
        {/* Logo with pulse effect */}
        <div className={`${sizeClasses[size]} relative z-10 animate-pulse`}>
          <img 
            src={logo} 
            alt="Loading..." 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
