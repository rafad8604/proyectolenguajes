import type { BibliographyTopic } from 'lib/config/bibliography';

interface BibliographySectionProps {
  topics: BibliographyTopic[];
}

export function BibliographySection({ topics }: BibliographySectionProps) {
  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <article
          key={topic.id}
          id={`bib-${topic.id}`}
          className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/50"
        >
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            {topic.topic}
          </h3>
          <ul className="mt-3 space-y-3">
            {topic.entries.map((entry) => (
              <li
                key={`${entry.authors}-${entry.title}`}
                className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
              >
                <p>
                  <span className="font-medium">{entry.authors}</span>
                  {entry.year && <> ({entry.year})</>}.{' '}
                  <em>{entry.title}</em>
                  {entry.edition && <>. {entry.edition}</>}
                  {entry.publisher && <>. {entry.publisher}</>}
                  .
                </p>
                {entry.url && (
                  <p className="mt-1">
                    <a
                      href={entry.url}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.url}
                    </a>
                  </p>
                )}
                {entry.note && (
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
