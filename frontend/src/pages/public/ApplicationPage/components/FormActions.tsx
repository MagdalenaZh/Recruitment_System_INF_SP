import { Button } from "../../../../components/ui/Button";

export function FormActions(props: {
  step: number;
  isSubmitting: boolean;
  canSubmit: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const { step, isSubmitting, canSubmit, onBack, onNext, onSubmit } = props;

  return (
    <div className="mt-10 flex items-center justify-between">
      <Button
        variant="secondary"
        type="button"
        onClick={onBack}
        disabled={step === 0 || isSubmitting}
      >
        Back
      </Button>

      {step < 2 ? (
        <Button type="button" onClick={onNext} disabled={isSubmitting}>
          Next
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit application"}
        </Button>
      )}
    </div>
  );
}
