// Projects, shown in order along the horizon on the homepage.
//
// To add a project, add an entry below. Only `name`, `description`, and `url`
// are required.
//
// - `status`  short state shown on the card, e.g. "Live", "Beta", "In progress".
//             "Live" gets a small lit marker.
// - `category` optional, e.g. "AI", "Tool", "Writing".
// - `image`   optional preview. Put the file in /public/projects and reference
//             it as "/projects/name.png". A 16:9 crop works best.
//
// The entries below are placeholders. Replace them with your real projects.
export type Project = {
  name: string;
  description: string;
  url: string;
  status?: string;
  category?: string;
  image?: string;
};

export const projects: Project[] = [
  {
    name: "Project one",
    description: "One line on what it does and who it's for.",
    url: "https://example.com",
    status: "Live",
    category: "AI",
  },
  {
    name: "Project two",
    description: "One line on what it does and who it's for.",
    url: "https://example.org",
    status: "In progress",
    category: "Tool",
  },
  {
    name: "Project three",
    description: "One line on what it does and who it's for.",
    url: "https://example.net",
    status: "Live",
    category: "Product",
  },
];
