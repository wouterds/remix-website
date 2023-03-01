import type {
  HeadersFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getBlogPost } from "~/lib/md.server";
import mdStyles from "~/styles/md.css";
import { useRef } from "react";
import { useDelegatedReactRouterLinks } from "~/ui/delegate-links";
import { CACHE_CONTROL } from "~/lib/http.server";
import { Header } from "~/ui/header";
import { Footer } from "~/ui/footer";
import { Subscribe } from "~/ui/subscribe";

export let loader = async ({ params, request }: LoaderArgs) => {
  let { slug } = params;
  invariant(!!slug, "Expected slug param");
  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  let post = await getBlogPost(slug);
  return json(
    { siteUrl, post },
    { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } }
  );
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export function links() {
  return [{ rel: "stylesheet", href: mdStyles }];
}

export let meta: MetaFunction<typeof loader> = ({ data, params }) => {
  let { slug } = params;
  invariant(!!slug, "Expected slug param");

  let { siteUrl, post } = data;
  // we should never get here since our loader throws a 404 :shrug:
  if (!post) {
    return {
      title: "Hey Not Found",
    };
  }

  let socialImageUrl = `${siteUrl}/img/social?${new URLSearchParams({
    slug,
    siteUrl,
    title: post.title,
    authorName: post.authors[0]?.name || "Michael Jackson",
    authorTitle: post.authors[0]?.title || "Co-Founder, CEO",
    date: post.dateDisplay,
  })}`;

  let url = `${siteUrl}/blog/${slug}`;

  return {
    title: post.title + " | Remix",
    description: post.summary,
    "og:url": url,
    "og:title": post.title,
    "og:image": socialImageUrl || undefined,
    "og:description": post.summary,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": post.title,
    "twitter:description": post.summary,
    "twitter:image": socialImageUrl || undefined,
    "twitter:image:alt": socialImageUrl ? post.imageAlt : undefined,
  };
};

export default function BlogPost() {
  let { post } = useLoaderData<typeof loader>();
  let mdRef = useRef<HTMLDivElement>(null);
  useDelegatedReactRouterLinks(mdRef);

  return (
    <div className="flex h-full flex-1 flex-col">
      <Header to="/blog" />
      {post.draft ? (
        <div className="m-auto mb-8 max-w-3xl rounded-sm bg-red-700 py-3 px-5 text-center text-gray-100 dark:bg-red-400 dark:text-gray-700">
          🚨 This is a draft, please do not share this page until it's
          officially published 🚨
        </div>
      ) : null}
      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          <div>
            <div className="relative h-[280px] bg-gray-900 md:mx-auto md:h-[400px] md:max-w-3xl md:rounded-xl xl:h-[480px]">
              <div className="absolute inset-0">
                <img
                  className="h-full w-full object-cover object-top opacity-40 md:rounded-xl"
                  src={post.image}
                  alt={post.imageAlt}
                />
              </div>
              <div className="container relative z-10 flex h-full w-full flex-col pt-6 md:pt-12 lg:max-w-4xl">
                <div className="flex-1">
                  <div className="text-sm uppercase text-gray-200 md:text-base">
                    {post.dateDisplay}
                  </div>
                  <div className="h-2" />
                  <div className="font-display text-3xl font-extrabold text-white md:text-4xl">
                    {post.title}
                  </div>
                  <div className="h-2" />
                </div>
                <div className="pb-4 md:pb-12">
                  {post.authors.map((author) => (
                    <div key={author.name} className="my-2 flex items-center">
                      <div>
                        <img
                          className="h-10 w-10 rounded-full md:h-14 md:w-14"
                          src={author.avatar}
                          alt=""
                        />
                      </div>
                      <div className="w-6" />
                      <div>
                        <div className="font-display text-xl font-extrabold leading-none text-white md:text-3xl">
                          {author.name}
                        </div>
                        <div className="text-base leading-tight text-gray-200 md:text-base">
                          {author.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-12" />
            <div className="container lg:max-w-3xl">
              {/* The markdown comes in via the parser wrapped in `div.md-prose`
                  so we don't need to do that here */}
              <div
                ref={mdRef}
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
              <hr />
            </div>
          </div>
        </div>
      </div>

      <div className="container m-auto mt-24 mb-12 max-w-lg">
        <h3 className="mb-6 text-xl font-bold lg:text-3xl">
          Get updates on the latest Remix news
        </h3>
        <div className="mb-6" id="newsletter-text">
          Be the first to learn about new Remix features, community events, and
          tutorials.
        </div>
        <Subscribe descriptionId="newsletter-text" />
      </div>
      <Footer />
    </div>
  );
}
