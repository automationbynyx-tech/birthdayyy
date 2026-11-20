type DecorativeClassName = {
  className?: string;
};

export function BotanicalSprig({ className = "" }: DecorativeClassName) {
  return (
    <svg
      className={`botanical-sprig ${className}`}
      viewBox="0 0 180 260"
      fill="none"
      aria-hidden="true"
    >
      <path className="botanical-stem" d="M17 250C43 210 57 174 76 137 98 95 122 61 158 25" />
      <path className="botanical-stem" d="M48 191C37 172 26 157 13 145M72 148C93 135 108 122 125 105M98 105C82 91 72 77 63 61M121 68C137 66 148 58 158 47" />
      <path className="botanical-leaf" d="M50 187C24 181 11 164 10 143 32 143 49 156 56 177 55 181 53 184 50 187Z" />
      <path className="botanical-vein" d="M13 146C28 157 41 170 52 183" />
      <path className="botanical-leaf" d="M75 146C78 122 95 108 120 104 118 126 102 142 79 151Z" />
      <path className="botanical-vein" d="M118 107C103 119 90 132 77 147" />
      <path className="botanical-leaf" d="M67 68C46 60 37 44 39 22 58 29 69 44 71 63Z" />
      <path className="botanical-vein" d="M41 25C52 38 61 51 69 66" />
      <path className="botanical-leaf" d="M101 99C101 77 115 62 138 55 140 77 127 94 105 103Z" />
      <path className="botanical-vein" d="M136 58C124 73 113 86 103 100" />
      <path className="botanical-leaf" d="M124 66C123 48 134 34 153 28 156 46 145 60 128 70Z" />
      <path className="botanical-vein" d="M151 31C142 43 134 54 126 67" />
      <g className="botanical-blossom">
        <path d="M157 10C160 17 166 18 173 18 169 24 170 30 174 36 166 35 161 39 158 46 154 39 149 36 141 37 145 30 145 24 141 18 149 19 154 16 157 10Z" />
        <path d="M157 19C160 24 164 25 168 26 164 29 163 33 162 37 159 33 155 32 151 32 154 28 155 24 157 19Z" />
        <circle cx="158" cy="29" r="3" />
      </g>
      <g className="botanical-blossom botanical-blossom-small">
        <circle cx="13" cy="143" r="3" />
        <circle cx="8" cy="137" r="2" />
        <circle cx="18" cy="136" r="2" />
        <circle cx="22" cy="145" r="2" />
      </g>
    </svg>
  );
}

export function FloatingPetals({ className = "" }: DecorativeClassName) {
  return (
    <div className={`petal-field ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((petal) => (
        <span className={`floating-petal floating-petal-${petal}`} key={petal} />
      ))}
    </div>
  );
}
