"use client";

import { useState, useEffect } from "react";
import { QRScanner } from "@/components/ui/qr-scanner";
import Stepper from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  teamNameSchema,
  kfidSchema,
  TeamRegisterResponse,
} from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

const steps = ["Team Name", "Member 1", "Member 2", "Member 3"];

const Home = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [kfids, setKfids] = useState<string[]>([]);
  const [currentKfid, setCurrentKfid] = useState("");
  const [registered, setRegistered] = useState<TeamRegisterResponse | null>(
    null
  );
  const { toast } = useToast();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const hasMinimumMembers = kfids.filter(Boolean).length >= 2;

  useEffect(() => {
    if (currentStep > 0) {
      setCurrentKfid(kfids[currentStep - 1] || "");
    }
  }, [currentStep, kfids]);

  const handleScan = (result: string) => {
    try {
      const { kfid } = kfidSchema.parse({ kfid: result });
      const otherKfids = kfids.filter((_, idx) => idx !== currentStep - 1);
      if (otherKfids.includes(kfid)) {
        toast({
          title: "Duplicate KFID",
          description: "This team member has already been added",
          variant: "destructive",
        });
        return;
      }

      const newKfids = [...kfids];
      newKfids[currentStep - 1] = kfid;
      setKfids(newKfids);
      setCurrentKfid(kfid);
      setScanning(false);
    } catch (error) {
      console.error(error);
      setErrors({ kfid: "Invalid KFID format" });
      toast({
        title: "Invalid KFID",
        description: "Please try scanning again",
        variant: "destructive",
      });
    }
  };

  const handleManualEntry = (value: string) => {
    try {
      const { kfid } = kfidSchema.parse({ kfid: value });
      const otherKfids = kfids.filter((_, idx) => idx !== currentStep - 1);
      if (otherKfids.includes(kfid)) {
        setErrors({ kfid: "This team member has already been added" });
        return;
      }

      const newKfids = [...kfids];
      newKfids[currentStep - 1] = kfid;
      setKfids(newKfids);
      setCurrentKfid("");
      // Only increment step if not on the last member
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      }
      setErrors({});
    } catch (error) {
      console.error(error);
      setErrors({ kfid: "Invalid KFID format" });
    }
  };

  const handleTeamNameSubmit = () => {
    try {
      teamNameSchema.parse({ teamName });
      setCurrentStep(1);
      setErrors({});
    } catch (error) {
      console.error(error);
      setErrors({ teamName: "Team name must be at least 3 characters" });
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(
        "https://lm-backend-api.rycerz.es/api/teams/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "123",
          },
          body: JSON.stringify({
            team_name: teamName,
            kfids: kfids.filter(Boolean),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.detail?.includes("KFIDs not registered in KIITFest")) {
          throw new Error(
            "Some team members are not registered for KIITFest. Please make sure all members are registered first."
          );
        }
        throw new Error(data.detail || data.message || "Registration failed");
      }

      setRegistered(data);
      console.log({
        title: "Team Registration Successful!",
        description: (
          <div className="mt-2 space-y-2">
            <p>
              <strong>Team Name:</strong> {teamName}
            </p>
            <p>
              <strong>Team ID:</strong> {data.team_id}
            </p>
            <p>
              <strong>Password:</strong> {data.password}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Please save these credentials
            </p>
          </div>
        ),
        duration: 10000, // Show for 10 seconds
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your connection and try again",
        variant: "destructive",
      });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
    }
  };

  const stepperSteps = steps.map((title, index) => ({
    title,
    isCompleted: index < currentStep,
    isCurrent: index === currentStep,
  }));

  if (registered) {
    return (
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold text-center">
          Registration Complete!
        </h1>
        <div className="p-4 border rounded-lg space-y-2">
          <p>
            <strong>Team Name:</strong> {teamName}
          </p>
          <p>
            <strong>Team ID:</strong> {registered.team_id}
          </p>
          <p>
            <strong>Password:</strong> {registered.password}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 px-4 bg-background py-8">
      <div className="container max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="relative grid place-items-center mx-auto">
            <Image
              src="/team-logo.png"
              alt="Team Registration"
              width={200}
              height={200}
              className="object-contain w-48"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Team Registration
            </h1>
            <p className="text-muted-foreground mt-2">
              Register your team for the competition
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <Stepper steps={stepperSteps} />

          {/* Show current KFIDs with improved styling */}
          {kfids.length > 0 && (
            <div className="mt-12 p-4 rounded-md bg-muted/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-sm font-medium">Current Team Members</h3>
              </div>
              <div className="space-y-2">
                {kfids.map((kfid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-background/50"
                  >
                    <span className="text-sm text-muted-foreground">
                      Member {index + 1}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {kfid}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-base font-medium">
                    What&apos;s your team name?
                  </label>
                  <Input
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={cn(
                      "text-lg py-6 px-4 bg-background/50 backdrop-blur-sm border-none ring-offset-background transition-all duration-200",
                      "placeholder:text-muted-foreground/50",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      errors.teamName && "ring-2 ring-destructive"
                    )}
                  />
                  {errors.teamName && (
                    <p className="text-sm text-destructive">
                      {errors.teamName}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleTeamNameSubmit}
                  className="w-full py-6 text-base"
                  size="lg"
                >
                  Continue
                </Button>
              </div>
            )}

            {[1, 2, 3].includes(currentStep) && (
              <div className="space-y-6">
                <div className="rounded-md p-4 bg-card/50">
                  <h2 className="text-lg font-semibold mb-4">
                    Team Member {currentStep}
                    {currentStep === 3 && " (Optional)"}
                  </h2>

                  {scanning ? (
                    <>
                      <div className="bg-card/50 p-4 rounded-md mb-4">
                        <QRScanner
                          onScan={handleScan}
                          onError={(error) => {
                            console.error(error);
                            toast({
                              title: "Scanner Error",
                              description:
                                "Please try again or enter KFID manually",
                              variant: "destructive",
                            });
                          }}
                          isScanning={scanning}
                        />
                      </div>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          onClick={() => setScanning(false)}
                          className="w-full"
                        >
                          Cancel Scanning
                        </Button>
                        {currentKfid && (
                          <Button
                            onClick={() => {
                              handleManualEntry(currentKfid);
                              setScanning(false);
                            }}
                            className="w-full"
                          >
                            Confirm KFID: {currentKfid}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                          KFID
                        </label>
                        <Input
                          placeholder={`Enter KFID for member ${currentStep}`}
                          value={currentKfid}
                          onChange={(e) => setCurrentKfid(e.target.value)}
                          className={cn(
                            "text-lg py-6 px-4 bg-background/50 backdrop-blur-sm border-none ring-offset-background transition-all duration-200",
                            "placeholder:text-muted-foreground/50",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          )}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && currentKfid) {
                              handleManualEntry(currentKfid);
                            }
                          }}
                        />
                        {errors.kfid && (
                          <p className="text-sm text-destructive">
                            {errors.kfid}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          onClick={() => setScanning(true)}
                          variant="outline"
                        >
                          Scan QR Code
                        </Button>
                        <Button
                          onClick={() =>
                            currentKfid && handleManualEntry(currentKfid)
                          }
                          disabled={!currentKfid}
                        >
                          Add Member
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPrevStep}
                    className="w-24"
                  >
                    Back
                  </Button>
                  {(currentStep === 3 ||
                    kfids.filter(Boolean).length === 3) && (
                    <Button onClick={handleRegister} className="w-24">
                      Register
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
