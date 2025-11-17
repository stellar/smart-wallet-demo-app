export const mapTextWithLinks = (items: { text: string; link?: string; removeBlankSpace?: boolean }[]) => {
  return items.map((subtitle, index) => {
    const blankSpace = `${index < items.length - 1 && !subtitle.removeBlankSpace ? ' ' : ''}`

    return subtitle.link ? (
      <span>
        <a className="underline" href={subtitle.link} target="_blank" rel="noopener noreferrer">
          {subtitle.text}
        </a>
        {blankSpace}
      </span>
    ) : (
      <span>
        {subtitle.text}
        {blankSpace}
      </span>
    )
  })
}
