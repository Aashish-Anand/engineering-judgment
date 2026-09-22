type DoodleArrowProps = {
  direction?: "curved-down-right" | "straight-right" | "down" | "curved-up-right";
  className?: string;
  width?: number;
  height?: number;
  color?: string;
};

export function DoodleArrow({
  direction = "curved-down-right",
  className = "",
  width,
  height,
  color = "#171717",
}: DoodleArrowProps) {
  if (direction === "curved-down-right") {
    return (
      <svg
        width={width || 36}
        height={height || 28}
        viewBox="0 0 40 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        aria-hidden="true"
      >
        <path
          d="M3 6C14 4 28 10 32 23"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 20L32 24L34 15"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === "straight-right") {
    return (
      <svg
        width={width || 28}
        height={height || 16}
        viewBox="0 0 32 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        aria-hidden="true"
      >
        <path
          d="M3 9C12 9.5 22 8.5 28 9"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M21 3L29 9L21 15"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === "down") {
    return (
      <svg
        width={width || 18}
        height={height || 28}
        viewBox="0 0 20 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        aria-hidden="true"
      >
        <path
          d="M10 2C9.5 11 10.5 20 10 28"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 21L10 29L16 21"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width || 36}
      height={height || 28}
      viewBox="0 0 40 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M4 24C12 24 28 20 33 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 7L34 6L33 16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
