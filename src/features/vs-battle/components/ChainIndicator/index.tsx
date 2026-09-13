import { useEffect, useRef, useState } from "react";
import { Pip, Row } from "./index.style";

const LABELS = ["BASIC", "SKILL 1", "SKILL 2"];

interface Props {
  step: 0 | 1 | 2;
  finished: boolean;
}

/** Lit pips = completed steps; next pip blinks; a break (step drops to 0 without a finisher) flashes red once. */
const ChainIndicator = ({ step, finished }: Props) => {
  const prev = useRef(step);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const dropped = prev.current > 0 && step === 0;
    prev.current = step;
    if (!dropped || finished) return;
    setBroken(true);
    const t = setTimeout(() => setBroken(false), 450);
    return () => clearTimeout(t);
  }, [step, finished]);

  return (
    <Row>
      {LABELS.map((label, i) => (
        <Pip
          key={label}
          lit={i < step}
          next={i === step && !broken}
          broken={broken}>
          {label}
        </Pip>
      ))}
    </Row>
  );
};

export default ChainIndicator;
