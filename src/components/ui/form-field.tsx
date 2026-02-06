import * as React from "react";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    
    return (
      <div className={cn("space-y-1", className)}>
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          id={inputId}
          ref={ref}
          className={cn(error && "border-destructive focus:border-destructive focus:ring-destructive/20")}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
