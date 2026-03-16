export const mapTextWithLinks = (items: { text: string; link?: string; removeBlankSpace?: boolean }[]) => {
  return items.map((subtitle, index) => {
    const blankSpace = `${index < items.length - 1 && !subtitle.removeBlankSpace ? ' ' : ''}`

    return subtitle.link ? (
      <span key={`${subtitle.text}-${index}`}>
        <a className="[color:inherit] underline" href={subtitle.link} target="_blank" rel="noopener noreferrer">
          {subtitle.text}
        </a>
        {blankSpace}
      </span>
    ) : (
      <span key={`${subtitle.text}-${index}`}>
        {subtitle.text}
        {blankSpace}
      </span>
    )
  })
}
