import { cn } from "@/lib/utils";

interface Step {
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface StepperProps {
  steps: Step[];
}

const Stepper = ({ steps }: StepperProps) => {
  return (
    <div className="flex items-center justify-center w-full  py-8 ">
      <div className="flex items-center min-w-full sm:min-w-[500px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center flex-1",
              index === steps.length - 1 && "flex-initial"
            )}
          >
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200",
                  step.isCompleted
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_-3px] shadow-primary/60"
                    : step.isCurrent
                    ? "border-2 border-primary bg-background text-primary shadow-lg"
                    : "border-2 border-muted-foreground/30 bg-background text-muted-foreground"
                )}
              >
                {step.isCompleted ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-sm sm:text-base font-semibold">
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "absolute mt-12 sm:mt-14 text-xs sm:text-sm font-medium text-center whitespace-nowrap",
                  "w-20 sm:w-24 -translate-x-1/2 left-1/2",
                  step.isCurrent
                    ? "text-primary"
                    : step.isCompleted
                    ? "text-primary/80"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-full h-[2px] mx-2 sm:mx-4 transition-colors duration-200">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    step.isCompleted
                      ? "bg-primary shadow-[0_0_12px_-3px] shadow-primary/60 w-full"
                      : "bg-muted-foreground/30 w-full"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
