// Projects, shown in order along the horizon on the homepage.
//
// To add a project, add an entry below. Keep the description to one short
// line; longer text is cut off on the card.
//
// - `status`  optional short state shown on the card, e.g. "Live", "Beta",
//             "In progress". "Live" gets a small lit marker.
// - `logo`    optional path to a square logo in /public, e.g.
//             "/projects/name.svg". Without one, the first letter is shown.
//
// The entries below are placeholders. Replace them with your real projects.
export type Project = {
  name: string;
  description: string;
  url: string;
  status?: string;
  logo?: string;
};

export const projects: Project[] = [
  {
    name: "Project one",
    description: "What it is, in a few words.",
    url: "https://example.com",
    status: "Live",
  },
  {
    name: "Project two",
    description: "What it is, in a few words.",
    url: "https://example.org",
    status: "In progress",
  },
  {
    name: "Project three",
    description: "What it is, in a few words.",
    url: "https://example.net",
    status: "Live",
  },
];
