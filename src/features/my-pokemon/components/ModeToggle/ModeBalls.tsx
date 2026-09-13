interface Props {
  count: number;
  active: boolean;
}

const ModeBalls = ({ count, active }: Props) => (
  <span style={{ display: "flex" }}>
    {Array.from({ length: count }, (_, index) => (
      <img
        key={index}
        src="/static/pokeball-transparent.png"
        alt=""
        width={14}
        height={14}
        style={{
          imageRendering: "pixelated",
          marginLeft: index ? -5 : 0,
          opacity: active ? 1 : 0.45,
        }}
      />
    ))}
  </span>
);

export default ModeBalls;
