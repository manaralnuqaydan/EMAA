import { t as commonjs } from "../_libs/estree+pluginutils.mjs";
import { a as WatchConfigOptions, i as ResolvedConfig, n as ConfigWatcher, o as ChokidarOptions, r as DotenvOptions, t as C12InputConfig } from "../_libs/c12+readdirp+chokidar.mjs";
import { n as CompatibilityDates, r as DateString, t as CompatibilityDateSpec } from "../_libs/compatx.mjs";
import { t as ProxyServerOptions } from "../_libs/httpxy.mjs";
import { t as TSConfig } from "../_libs/pkg-types.mjs";
import { n as Unimport, t as UnimportPluginOptions } from "../_libs/unplugin+unimport.mjs";
import { t as UnwasmPluginOptions } from "../_libs/unwasm.mjs";
import { n as RouterContext, t as RouterCompilerOptions } from "../_libs/rou3.mjs";
import { t as ProviderName } from "../_libs/std-env.mjs";
import { ConsolaInstance, LogLevel } from "consola";
import { Hookable, HookableCore, NestedHooks } from "hookable";
import { version } from "nitro/meta";
import { EnvRunner, EnvRunnerData, FetchHandler, RunnerMessageListener, RunnerName, RunnerRPCHooks, UpgradeHandler, WorkerAddress, WorkerHooks } from "env-runner";
import { BasicAuthOptions, H3Core, HTTPError, HTTPEvent, HTTPHandler, HTTPMethod, Middleware, ProxyOptions } from "h3";
import { ServerRequest, ServerRequest as ServerRequest$1 } from "srvx";
import { Preset } from "unenv";
import { ConnectorName } from "db0";
import { BuiltinDriverName } from "unstorage";
import { Nitro as Nitro$1 } from "nitro/types";
import { InputOptions, MinifyOptions, OutputOptions, TransformOptions } from "rolldown";
import { InputOptions as InputOptions$1, OutputOptions as OutputOptions$1 } from "rollup";
import { FetchOptions, FetchRequest, FetchResponse } from "ofetch";
import * as _$ocache from "ocache";
import { CacheEntry, CacheOptions, ResponseCacheEntry } from "ocache";
import { ExecutionContext, ForwardableEmailMessage, MessageBatch, ScheduledController, TraceItem } from "@cloudflare/workers-types";
import { DurableObject } from "cloudflare:workers";
import * as _$_vercel_queue0 from "@vercel/queue";
import { send } from "@vercel/queue";
import { ExternalsTraceOptions } from "nf3";
interface InternalApi {}
type RouterMethod = Lowercase<HTTPMethod>;
type NitroFetchRequest = Exclude<keyof InternalApi, `/_${string}` | `/api/_${string}`> | Exclude<FetchRequest, string> | (string & {});
type MiddlewareOf<Route extends string, Method extends RouterMethod | "default"> = Method extends keyof InternalApi[MatchedRoutes<Route>] ? InternalApi[MatchedRoutes<Route>][Method] : never;
type TypedInternalResponse<Route, Default = unknown, Method extends RouterMethod = RouterMethod> = Default extends string | boolean | number | null | void | object ? Default : Route extends string ? MiddlewareOf<Route, Method> extends never ? MiddlewareOf<Route, "default"> extends never ? Default : MiddlewareOf<Route, "default"> : MiddlewareOf<Route, Method> : Default;
type AvailableRouterMethod<R extends NitroFetchRequest> = R extends string ? keyof InternalApi[MatchedRoutes<R>] extends undefined ? RouterMethod : Extract<keyof InternalApi[MatchedRoutes<R>], "default"> extends undefined ? Extract<RouterMethod, keyof InternalApi[MatchedRoutes<R>]> : RouterMethod : RouterMethod;
interface NitroFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>> extends FetchOptions {
  method?: Uppercase<M> | M;
}
type ExtractedRouteMethod<R extends NitroFetchRequest, O extends NitroFetchOptions<R>> = O extends undefined ? "get" : Lowercase<Exclude<O["method"], undefined>> extends RouterMethod ? Lowercase<Exclude<O["method"], undefined>> : "get";
type Base$Fetch<DefaultT = unknown, DefaultR extends NitroFetchRequest = NitroFetchRequest> = <T = DefaultT, R extends NitroFetchRequest = DefaultR, O extends NitroFetchOptions<R> = NitroFetchOptions<R>>(request: R, opts?: O) => Promise<TypedInternalResponse<R, T, NitroFetchOptions<R> extends O ? "get" : ExtractedRouteMethod<R, O>>>;
interface $Fetch<DefaultT = unknown, DefaultR extends NitroFetchRequest = NitroFetchRequest> extends Base$Fetch<DefaultT, DefaultR> {
  raw<T = DefaultT, R extends NitroFetchRequest = DefaultR, O extends NitroFetchOptions<R> = NitroFetchOptions<R>>(request: R, opts?: O): Promise<FetchResponse<TypedInternalResponse<R, T, NitroFetchOptions<R> extends O ? "get" : ExtractedRouteMethod<R, O>>>>;
  create<T = DefaultT, R extends NitroFetchRequest = DefaultR>(defaults: FetchOptions): $Fetch<T, R>;
}
type MatchResult<Key extends string, Exact extends boolean = false, Score extends any[] = [], catchAll extends boolean = false> = { [k in Key]: {
  key: k;
  exact: Exact;
  score: Score;
  catchAll: catchAll;
} }[Key];
type Subtract<Minuend extends any[] = [], Subtrahend extends any[] = []> = Minuend extends [...Subtrahend, ...infer Remainder] ? Remainder : never;
type TupleIfDiff<First extends string, Second extends string, Tuple extends any[] = []> = First extends `${Second}${infer Diff}` ? (Diff extends "" ? [] : Tuple) : [];
type MaxTuple<N extends any[] = [], T extends any[] = []> = {
  current: T;
  result: MaxTuple<N, ["", ...T]>;
}[[N["length"]] extends [Partial<T>["length"]] ? "current" : "result"];
type CalcMatchScore<Key extends string, Route extends string, Score extends any[] = [], Init extends boolean = false, FirstKeySegMatcher extends string = (Init extends true ? ":Invalid:" : "")> = `${Key}/` extends `${infer KeySeg}/${infer KeyRest}` ? KeySeg extends FirstKeySegMatcher ? Subtract<[...Score, ...TupleIfDiff<Route, Key, ["", ""]>], TupleIfDiff<Key, Route, ["", ""]>> : `${Route}/` extends `${infer RouteSeg}/${infer RouteRest}` ? `${RouteSeg}?` extends `${infer RouteSegWithoutQuery}?${string}` ? RouteSegWithoutQuery extends KeySeg ? CalcMatchScore<KeyRest, RouteRest, [...Score, "", ""]> : KeySeg extends `:${string}` ? RouteSegWithoutQuery extends "" ? never : CalcMatchScore<KeyRest, RouteRest, [...Score, ""]> : KeySeg extends RouteSegWithoutQuery ? CalcMatchScore<KeyRest, RouteRest, [...Score, ""]> : never : never : never : never;
type _MatchedRoutes<Route extends string, MatchedResultUnion extends MatchResult<string> = MatchResult<keyof InternalApi>> = MatchedResultUnion["key"] extends infer MatchedKeys ? MatchedKeys extends string ? Route extends MatchedKeys ? MatchResult<MatchedKeys, true> : MatchedKeys extends `${infer Root}/**${string}` ? MatchedKeys extends `${string}/**` ? Route extends `${Root}/${string}` ? MatchResult<MatchedKeys, false, [], true> : never : MatchResult<MatchedKeys, false, CalcMatchScore<Root, Route, [], true>> : MatchResult<MatchedKeys, false, CalcMatchScore<MatchedKeys, Route, [], true>> : never : never;
type MatchedRoutes<Route extends string, MatchedKeysResult extends MatchResult<string> = MatchResult<keyof InternalApi>, Matches extends MatchResult<string> = _MatchedRoutes<Route, MatchedKeysResult>> = Route extends "/" ? keyof InternalApi : Extract<Matches, {
  exact: true;
}> extends never ? Extract<Exclude<Matches, {
  score: never;
}>, {
  score: MaxTuple<Matches["score"]>;
}>["key"] | Extract<Matches, {
  catchAll: true;
}>["key"] : Extract<Matches, {
  exact: true;
}>["key"];
/**
 * @link https://github.com/remix-run/remix/blob/2248669ed59fd716e267ea41df5d665d4781f4a9/packages/remix-server-runtime/serialize.ts
 */
type JsonPrimitive = string | number | boolean | string | number | boolean | null;
type NonJsonPrimitive = undefined | Function | symbol;
type IsAny<T> = 0 extends 1 & T ? true : false;
type FilterKeys<TObj extends object, TFilter> = { [TKey in keyof TObj]: TObj[TKey] extends TFilter ? TKey : never }[keyof TObj];
type Serialize<T> = IsAny<T> extends true ? any : T extends JsonPrimitive | undefined ? T : T extends Map<any, any> | Set<any> ? Record<string, never> : T extends NonJsonPrimitive ? never : T extends {
  toJSON(): infer U;
} ? U : T extends [] ? [] : T extends [unknown, ...unknown[]] ? SerializeTuple<T> : T extends ReadonlyArray<infer U> ? (U extends NonJsonPrimitive ? null : Serialize<U>)[] : T extends object ? SerializeObject<T> : never;
/** JSON serialize [tuples](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) */
type SerializeTuple<T extends [unknown, ...unknown[]]> = { [k in keyof T]: T[k] extends NonJsonPrimitive ? null : Serialize<T[k]> };
/** JSON serialize objects (not including arrays) and classes */
type SerializeObject<T extends object> = { [k in keyof Omit<T, FilterKeys<T, NonJsonPrimitive>>]: Serialize<T[k]> };
/**
 * @see https://github.com/ianstormtaylor/superstruct/blob/7973400cd04d8ad92bbdc2b6f35acbfb3c934079/src/utils.ts#L323-L325
 */
type Simplify<TType> = TType extends any[] | Date ? TType : { [K in keyof TType]: Simplify<TType[K]> };
interface PublicAsset {
  type: string;
  etag: string;
  mtime: string;
  path: string;
  size: number;
  encoding?: string;
  data?: string;
}
interface AssetMeta {
  type?: string;
  etag?: string;
  mtime?: string;
}
/**
 * Options for `defineCachedHandler`.
 *
 * @see https://nitro.build/docs/cache
 */
interface CachedEventHandlerOptions extends Omit<_$ocache.CachedEventHandlerOptions<HTTPEvent & _$ocache.HTTPEvent>, "toResponse" | "createResponse" | "handleCacheHeaders"> {}
/**
 * The runtime Nitro application instance accessible via `useNitroApp()`.
 *
 * @see https://nitro.build/docs/plugins
 */
interface NitroApp {
  fetch: (req: Request) => Response | Promise<Response>;
  h3?: H3Core;
  hooks?: HookableCore<NitroRuntimeHooks>;
  captureError?: CaptureError;
}
/**
 * A Nitro runtime plugin function.
 *
 * Receives the {@link NitroApp} instance (with `hooks` guaranteed to exist)
 * and can register runtime hooks or modify the app.
 *
 * @see https://nitro.build/docs/plugins
 */
interface NitroAppPlugin {
  (nitro: NitroApp & {
    hooks: NonNullable<NitroApp["hooks"]>;
  }): void;
}
interface NitroAsyncContext {
  request: ServerRequest$1;
}
interface RenderResponse {
  body: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
type RenderHandler = (event: HTTPEvent) => Partial<RenderResponse> | Promise<Partial<RenderResponse>>;
interface RenderContext {
  event: HTTPEvent;
  render: RenderHandler;
  response?: Partial<RenderResponse>;
}
/** Context provided when an error is captured at runtime. */
interface CapturedErrorContext {
  event?: HTTPEvent;
  tags?: string[];
}
/** Error capture callback used by `nitroApp.captureError`. */
type CaptureError = (error: Error, context: CapturedErrorContext) => void;
/**
 * Runtime hooks available in Nitro plugins.
 *
 * @see https://nitro.build/docs/plugins
 * @see https://nitro.build/docs/lifecycle
 */
interface NitroRuntimeHooks {
  close: () => void;
  error: CaptureError;
  request: (event: HTTPEvent) => void | Promise<void>;
  response: (res: Response, event: HTTPEvent) => void | Promise<void>;
}
type MaybePromise$1<T> = T | Promise<T>;
/** @experimental */
interface TaskContext {}
/** @experimental */
interface TaskPayload {
  [key: string]: unknown;
}
/** @experimental */
interface TaskMeta {
  name?: string;
  description?: string;
}
/** @experimental */
interface TaskEvent {
  name: string;
  payload: TaskPayload;
  context: TaskContext;
}
/** @experimental */
interface TaskResult<RT = unknown> {
  result?: RT;
}
/** @experimental */
interface Task<RT = unknown> {
  meta?: TaskMeta;
  run(event: TaskEvent): MaybePromise$1<{
    result?: RT;
  }>;
}
/** @experimental */
interface TaskRunnerOptions {
  cwd?: string;
  buildDir?: string;
}
type AmplifyImageSettings = {
  /** Array of supported image widths */sizes: number[];
  /**
   * Array of allowed external domains that can use Image Optimization.
   * Leave empty for only allowing the deployment domain to use Image Optimization.
   */
  domains: string[];
  /**
   * Array of allowed external patterns that can use Image Optimization.
   * Similar to `domains` but provides more control with RegExp.
   */
  remotePatterns: {
    /** The protocol of the allowed remote pattern. Can be `http` or `https`. */protocol?: "http" | "https";
    /**
     * The hostname of the allowed remote pattern.
     * Can be literal or wildcard. Single `*` matches a single subdomain.
     *  Double `**` matches any number of subdomains.
     * We will disallow blanket wildcards of `**` with nothing else.
     */
    hostname: string; /** The port of the allowed remote pattern. */
    port?: string; /** The pathname of the allowed remote pattern. */
    pathname?: string;
  }[]; /** Array of allowed output image formats. */
  formats: ("image/avif" | "image/webp" | "image/gif" | "image/png" | "image/jpeg")[]; /** Cache duration (in seconds) for the optimized images. */
  minimumCacheTTL: number; /** Allow SVG input image URLs. This is disabled by default for security purposes. */
  dangerouslyAllowSVG: boolean;
};
interface AWSAmplifyOptions {
  catchAllStaticFallback?: boolean;
  imageOptimization?: {
    path?: string;
    cacheControl?: string;
  };
  imageSettings?: AmplifyImageSettings;
  runtime?: "nodejs20.x" | "nodejs22.x";
}
interface AwsLambdaOptions {
  streaming?: boolean;
}
interface AzureOptions {
  config?: {
    platform?: {
      apiRuntime?: string;
      [key: string]: unknown;
    };
    navigationFallback?: {
      rewrite?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}
/**
 * Copyright (c) 2020 Cloudflare, Inc. <wrangler@cloudflare.com>
 * https://github.com/cloudflare/workers-sdk/blob/main/LICENSE-MIT
 * https://github.com/cloudflare/workers-sdk/blob/main/LICENSE-APACHE
 *
 * Source: https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/src/config/environment.ts
 */
/**
 * The `Environment` interface declares all the configuration fields that
 * can be specified for an environment.
 *
 * This could be the top-level default environment, or a specific named environment.
 */
interface Environment extends EnvironmentInheritable, EnvironmentNonInheritable {}
type SimpleRoute = string;
type ZoneIdRoute = {
  pattern: string;
  zone_id: string;
  custom_domain?: boolean;
};
type ZoneNameRoute = {
  pattern: string;
  zone_name: string;
  custom_domain?: boolean;
};
type CustomDomainRoute = {
  pattern: string;
  custom_domain: boolean;
};
type Route$1 = SimpleRoute | ZoneIdRoute | ZoneNameRoute | CustomDomainRoute;
/**
 * Configuration in wrangler for Cloudchamber
 */
type CloudchamberConfig = {
  image?: string;
  location?: string;
  instance_type?: "dev" | "basic" | "standard";
  vcpu?: number;
  memory?: string;
  ipv4?: boolean;
};
/**
 * Configuration for a container application
 */
type ContainerApp = {
  /**
   * Name of the application
   * @optional Defaults to `worker_name-class_name` if not specified.
   */
  name?: string;
  /**
   * Number of application instances
   * @deprecated
   * @hidden
   */
  instances?: number;
  /**
   * Number of maximum application instances.
   * @optional
   */
  max_instances?: number;
  /**
   * The path to a Dockerfile, or an image URI for the Cloudflare registry.
   */
  image: string;
  /**
   * Build context of the application.
   * @optional - defaults to the directory of `image`.
   */
  image_build_context?: string;
  /**
   * Image variables to be passed along the image at build time.
   * @optional
   */
  image_vars?: Record<string, string>;
  /**
   * The class name of the Durable Object the container is connected to.
   */
  class_name: string;
  /**
   * The scheduling policy of the application
   * @optional
   * @default "default"
   */
  scheduling_policy?: "regional" | "moon" | "default";
  /**
   * The instance type to be used for the container. This sets preconfigured options for vcpu and memory
   * @optional
   */
  instance_type?: "dev" | "basic" | "standard";
  /**
   * @deprecated Use top level `containers` fields instead.
   * `configuration.image` should be `image`
   * `configuration.disk` should be set via `instance_type`
   * @hidden
   */
  configuration?: {
    image?: string;
    labels?: {
      name: string;
      value: string;
    }[];
    secrets?: {
      name: string;
      type: "env";
      secret: string;
    }[];
    disk?: {
      size: string;
    };
  };
  /**
   * Scheduling constraints
   * @hidden
   */
  constraints?: {
    regions?: string[];
    cities?: string[];
    tier?: number;
  };
  /**
   * @deprecated use the `class_name` field instead.
   * @hidden
   */
  durable_objects?: {
    namespace_id: string;
  };
  /**
   * How a rollout should be done, defining the size of it
   * @optional
   * @default 25
   * */
  rollout_step_percentage?: number;
  /**
   * How a rollout should be created. It supports the following modes:
   *  - full_auto: The container application will be rolled out fully automatically.
   *  - none: The container application won't have a roll out or update.
   *  - manual: The container application will be rollout fully by manually actioning progress steps.
   * @optional
   * @default "full_auto"
   */
  rollout_kind?: "full_auto" | "none" | "full_manual";
};
/**
 * Configuration in wrangler for Durable Object Migrations
 */
type DurableObjectMigration = {
  /** A unique identifier for this migration. */tag: string; /** The new Durable Objects being defined. */
  new_classes?: string[]; /** The new SQLite Durable Objects being defined. */
  new_sqlite_classes?: string[]; /** The Durable Objects being renamed. */
  renamed_classes?: {
    from: string;
    to: string;
  }[]; /** The Durable Objects being removed. */
  deleted_classes?: string[];
};
/**
 * The `EnvironmentInheritable` interface declares all the configuration fields for an environment
 * that can be inherited (and overridden) from the top-level environment.
 */
interface EnvironmentInheritable {
  /**
   * The name of your Worker. Alphanumeric + dashes only.
   *
   * @inheritable
   */
  name: string | undefined;
  /**
   * This is the ID of the account associated with your zone.
   * You might have more than one account, so make sure to use
   * the ID of the account associated with the zone/route you
   * provide, if you provide one. It can also be specified through
   * the CLOUDFLARE_ACCOUNT_ID environment variable.
   *
   * @inheritable
   */
  account_id: string | undefined;
  /**
   * A date in the form yyyy-mm-dd, which will be used to determine
   * which version of the Workers runtime is used.
   *
   * More details at https://developers.cloudflare.com/workers/configuration/compatibility-dates
   *
   * @inheritable
   */
  compatibility_date: string | undefined;
  /**
   * A list of flags that enable features from upcoming features of
   * the Workers runtime, usually used together with compatibility_date.
   *
   * More details at https://developers.cloudflare.com/workers/configuration/compatibility-flags/
   *
   * @default []
   * @inheritable
   */
  compatibility_flags: string[];
  /**
   * The entrypoint/path to the JavaScript file that will be executed.
   *
   * @inheritable
   */
  main: string | undefined;
  /**
   * If true then Wrangler will traverse the file tree below `base_dir`;
   * Any files that match `rules` will be included in the deployed Worker.
   * Defaults to true if `no_bundle` is true, otherwise false.
   *
   * @inheritable
   */
  find_additional_modules: boolean | undefined;
  /**
   * Determines whether Wrangler will preserve bundled file names.
   * Defaults to false.
   * If left unset, files will be named using the pattern ${fileHash}-${basename},
   * for example, `34de60b44167af5c5a709e62a4e20c4f18c9e3b6-favicon.ico`.
   *
   * @inheritable
   */
  preserve_file_names: boolean | undefined;
  /**
   * The directory in which module rules should be evaluated when including additional files into a Worker deployment.
   * This defaults to the directory containing the `main` entry point of the Worker if not specified.
   *
   * @inheritable
   */
  base_dir: string | undefined;
  /**
   * Whether we use <name>.<subdomain>.workers.dev to
   * test and deploy your Worker.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
   *
   * @default true
   * @breaking
   * @inheritable
   */
  workers_dev: boolean | undefined;
  /**
   * Whether we use <version>-<name>.<subdomain>.workers.dev to
   * serve Preview URLs for your Worker.
   *
   * @default true
   * @inheritable
   */
  preview_urls: boolean | undefined;
  /**
   * A list of routes that your Worker should be published to.
   * Only one of `routes` or `route` is required.
   *
   * Only required when workers_dev is false, and there's no scheduled Worker (see `triggers`)
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#types-of-routes
   *
   * @inheritable
   */
  routes: Route$1[] | undefined;
  /**
   * A route that your Worker should be published to. Literally
   * the same as routes, but only one.
   * Only one of `routes` or `route` is required.
   *
   * Only required when workers_dev is false, and there's no scheduled Worker
   *
   * @inheritable
   */
  route: Route$1 | undefined;
  /**
   * Path to a custom tsconfig
   *
   * @inheritable
   */
  tsconfig: string | undefined;
  /**
   * The function to use to replace jsx syntax.
   *
   * @default "React.createElement"
   * @inheritable
   */
  jsx_factory: string;
  /**
   * The function to use to replace jsx fragment syntax.
   *
   * @default "React.Fragment"
   * @inheritable
   */
  jsx_fragment: string;
  /**
   * A list of migrations that should be uploaded with your Worker.
   *
   * These define changes in your Durable Object declarations.
   *
   * More details at https://developers.cloudflare.com/workers/learning/using-durable-objects#configuring-durable-object-classes-with-migrations
   *
   * @default []
   * @inheritable
   */
  migrations: DurableObjectMigration[];
  /**
   * "Cron" definitions to trigger a Worker's "scheduled" function.
   *
   * Lets you call Workers periodically, much like a cron job.
   *
   * More details here https://developers.cloudflare.com/workers/platform/cron-triggers
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers
   *
   * @default {crons: undefined}
   * @inheritable
   */
  triggers: {
    crons: string[] | undefined;
  };
  /**
   * Specify limits for runtime behavior.
   * Only supported for the "standard" Usage Model
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#limits
   *
   * @inheritable
   */
  limits: UserLimits | undefined;
  /**
   * An ordered list of rules that define which modules to import,
   * and what type to import them as. You will need to specify rules
   * to use Text, Data, and CompiledWasm modules, or when you wish to
   * have a .js file be treated as an ESModule instead of CommonJS.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#bundling
   *
   * @inheritable
   */
  rules: Rule[];
  /**
   * Configures a custom build step to be run by Wrangler when building your Worker.
   *
   * Refer to the [custom builds documentation](https://developers.cloudflare.com/workers/cli-wrangler/configuration#build)
   * for more details.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#custom-builds
   *
   * @default {watch_dir:"./src"}
   */
  build: {
    /** The command used to build your Worker. On Linux and macOS, the command is executed in the `sh` shell and the `cmd` shell for Windows. The `&&` and `||` shell operators may be used. */command?: string; /** The directory in which the command is executed. */
    cwd?: string; /** The directory to watch for changes while using wrangler dev, defaults to the current working directory */
    watch_dir?: string | string[];
  };
  /**
   * Skip internal build steps and directly deploy script
   * @inheritable
   */
  no_bundle: boolean | undefined;
  /**
   * Minify the script before uploading.
   * @inheritable
   */
  minify: boolean | undefined;
  /**
   * Set the `name` property to the original name for functions and classes renamed during minification.
   *
   * See https://esbuild.github.io/api/#keep-names
   *
   * @default true
   * @inheritable
   */
  keep_names: boolean | undefined;
  /**
   * Designates this Worker as an internal-only "first-party" Worker.
   *
   * @inheritable
   */
  first_party_worker: boolean | undefined;
  /**
   * List of bindings that you will send to logfwdr
   *
   * @default {bindings:[]}
   * @inheritable
   */
  logfwdr: {
    bindings: {
      /** The binding name used to refer to logfwdr */name: string; /** The destination for this logged message */
      destination: string;
    }[];
  };
  /**
   * Send Trace Events from this Worker to Workers Logpush.
   *
   * This will not configure a corresponding Logpush job automatically.
   *
   * For more information about Workers Logpush, see:
   * https://blog.cloudflare.com/logpush-for-workers/
   *
   * @inheritable
   */
  logpush: boolean | undefined;
  /**
   * Include source maps when uploading this worker.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#source-maps
   *
   * @inheritable
   */
  upload_source_maps: boolean | undefined;
  /**
   * Specify how the Worker should be located to minimize round-trip time.
   *
   * More details: https://developers.cloudflare.com/workers/platform/smart-placement/
   *
   * @inheritable
   */
  placement: {
    mode: "off" | "smart";
    hint?: string;
  } | undefined;
  /**
   * Specify the directory of static assets to deploy/serve
   *
   * More details at https://developers.cloudflare.com/workers/frameworks/
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#assets
   *
   * @inheritable
   */
  assets: Assets | undefined;
  /**
   * Specify the observability behavior of the Worker.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#observability
   *
   * @inheritable
   */
  observability: Observability | undefined;
  /**
   * Specify the compliance region mode of the Worker.
   *
   * Although if the user does not specify a compliance region, the default is `public`,
   * it can be set to `undefined` in configuration to delegate to the CLOUDFLARE_COMPLIANCE_REGION environment variable.
   */
  compliance_region: "public" | "fedramp_high" | undefined;
}
type DurableObjectBindings = {
  /** The name of the binding used to refer to the Durable Object */name: string; /** The exported class name of the Durable Object */
  class_name: string; /** The script where the Durable Object is defined (if it's external to this Worker) */
  script_name?: string; /** The service environment of the script_name to bind to */
  environment?: string;
}[];
type WorkflowBinding = {
  /** The name of the binding used to refer to the Workflow */binding: string; /** The name of the Workflow */
  name: string; /** The exported class name of the Workflow */
  class_name: string; /** The script where the Workflow is defined (if it's external to this Worker) */
  script_name?: string; /** Whether the Workflow should be remote or not (only available under `--x-remote-bindings`) */
  experimental_remote?: boolean;
};
/**
 * The `EnvironmentNonInheritable` interface declares all the configuration fields for an environment
 * that cannot be inherited from the top-level environment, and must be defined specifically.
 *
 * If any of these fields are defined at the top-level then they should also be specifically defined
 * for each named environment.
 */
interface EnvironmentNonInheritable {
  /**
   * A map of values to substitute when deploying your Worker.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default {}
   * @nonInheritable
   */
  define: Record<string, string>;
  /**
   * A map of environment variables to set when deploying your Worker.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#environment-variables
   *
   * @default {}
   * @nonInheritable
   */
  vars: Record<string, unknown>;
  /**
   * A list of durable objects that your Worker should be bound to.
   *
   * For more information about Durable Objects, see the documentation at
   * https://developers.cloudflare.com/workers/learning/using-durable-objects
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#durable-objects
   *
   * @default {bindings:[]}
   * @nonInheritable
   */
  durable_objects: {
    bindings: DurableObjectBindings;
  };
  /**
   * A list of workflows that your Worker should be bound to.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default []
   * @nonInheritable
   */
  workflows: WorkflowBinding[];
  /**
   * Cloudchamber configuration
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default {}
   * @nonInheritable
   */
  cloudchamber: CloudchamberConfig;
  /**
   * Container related configuration
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default []
   * @nonInheritable
   */
  containers?: ContainerApp[];
  /**
   * These specify any Workers KV Namespaces you want to
   * access from inside your Worker.
   *
   * To learn more about KV Namespaces,
   * see the documentation at https://developers.cloudflare.com/workers/learning/how-kv-works
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#kv-namespaces
   *
   * @default []
   * @nonInheritable
   */
  kv_namespaces: {
    /** The binding name used to refer to the KV Namespace */binding: string; /** The ID of the KV namespace */
    id?: string; /** The ID of the KV namespace used during `wrangler dev` */
    preview_id?: string; /** Whether the KV namespace should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  }[];
  /**
   * These specify bindings to send email from inside your Worker.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#email-bindings
   *
   * @default []
   * @nonInheritable
   */
  send_email: {
    /** The binding name used to refer to the this binding */name: string; /** If this binding should be restricted to a specific verified address */
    destination_address?: string; /** If this binding should be restricted to a set of verified addresses */
    allowed_destination_addresses?: string[];
  }[];
  /**
   * Specifies Queues that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#queues
   *
   * @default {consumers:[],producers:[]}
   * @nonInheritable
   */
  queues: {
    /** Producer bindings */producers?: {
      /** The binding name used to refer to the Queue in the Worker. */binding: string; /** The name of this Queue. */
      queue: string; /** The number of seconds to wait before delivering a message */
      delivery_delay?: number; /** Whether the Queue producer should be remote or not (only available under `--x-remote-bindings`) */
      experimental_remote?: boolean;
    }[]; /** Consumer configuration */
    consumers?: {
      /** The name of the queue from which this consumer should consume. */queue: string; /** The consumer type, e.g., worker, http-pull, r2-bucket, etc. Default is worker. */
      type?: string; /** The maximum number of messages per batch */
      max_batch_size?: number; /** The maximum number of seconds to wait to fill a batch with messages. */
      max_batch_timeout?: number; /** The maximum number of retries for each message. */
      max_retries?: number; /** The queue to send messages that failed to be consumed. */
      dead_letter_queue?: string; /** The maximum number of concurrent consumer Worker invocations. Leaving this unset will allow your consumer to scale to the maximum concurrency needed to keep up with the message backlog. */
      max_concurrency?: number | null; /** The number of milliseconds to wait for pulled messages to become visible again */
      visibility_timeout_ms?: number; /** The number of seconds to wait before retrying a message */
      retry_delay?: number;
    }[];
  };
  /**
   * Specifies R2 buckets that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#r2-buckets
   *
   * @default []
   * @nonInheritable
   */
  r2_buckets: {
    /** The binding name used to refer to the R2 bucket in the Worker. */binding: string; /** The name of this R2 bucket at the edge. */
    bucket_name?: string; /** The preview name of this R2 bucket at the edge. */
    preview_bucket_name?: string; /** The jurisdiction that the bucket exists in. Default if not present. */
    jurisdiction?: string; /** Whether the R2 bucket should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  }[];
  /**
   * Specifies D1 databases that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases
   *
   * @default []
   * @nonInheritable
   */
  d1_databases: {
    /** The binding name used to refer to the D1 database in the Worker. */binding: string; /** The name of this D1 database. */
    database_name?: string; /** The UUID of this D1 database (not required). */
    database_id?: string; /** The UUID of this D1 database for Wrangler Dev (if specified). */
    preview_database_id?: string; /** The name of the migrations table for this D1 database (defaults to 'd1_migrations'). */
    migrations_table?: string; /** The path to the directory of migrations for this D1 database (defaults to './migrations'). */
    migrations_dir?: string; /** Internal use only. */
    database_internal_env?: string; /** Whether the D1 database should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  }[];
  /**
   * Specifies Vectorize indexes that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#vectorize-indexes
   *
   * @default []
   * @nonInheritable
   */
  vectorize: {
    /** The binding name used to refer to the Vectorize index in the Worker. */binding: string; /** The name of the index. */
    index_name: string; /** Whether the Vectorize index should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  }[];
  /**
   * Specifies Hyperdrive configs that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#hyperdrive
   *
   * @default []
   * @nonInheritable
   */
  hyperdrive: {
    /** The binding name used to refer to the project in the Worker. */binding: string; /** The id of the database. */
    id: string; /** The local database connection string for `wrangler dev` */
    localConnectionString?: string;
  }[];
  /**
   * Specifies service bindings (Worker-to-Worker) that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#service-bindings
   *
   * @default []
   * @nonInheritable
   */
  services: {
    /** The binding name used to refer to the bound service. */binding: string; /** The name of the service. */
    service: string; /** The environment of the service (e.g. production, staging, etc). */
    environment?: string; /** Optionally, the entrypoint (named export) of the service to bind to. */
    entrypoint?: string; /** Optional properties that will be made available to the service via ctx.props. */
    props?: Record<string, unknown>; /** Whether the service binding should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  }[] | undefined;
  /**
   * Specifies analytics engine datasets that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#analytics-engine-datasets
   *
   * @default []
   * @nonInheritable
   */
  analytics_engine_datasets: {
    /** The binding name used to refer to the dataset in the Worker. */binding: string; /** The name of this dataset to write to. */
    dataset?: string;
  }[];
  /**
   * A browser that will be usable from the Worker.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#browser-rendering
   *
   * @default {}
   * @nonInheritable
   */
  browser: {
    binding: string; /** Whether the Browser binding should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  } | undefined;
  /**
   * Binding to the AI project.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#workers-ai
   *
   * @default {}
   * @nonInheritable
   */
  ai: {
    binding: string;
    staging?: boolean; /** Whether the AI binding should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  } | undefined;
  /**
   * Binding to Cloudflare Images
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#images
   *
   * @default {}
   * @nonInheritable
   */
  images: {
    binding: string; /** Whether the Images binding should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  } | undefined;
  /**
   * Binding to the Worker Version's metadata
   */
  version_metadata: {
    binding: string;
  } | undefined;
  /**
   * "Unsafe" tables for features that aren't directly supported by wrangler.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default {}
   * @nonInheritable
   */
  unsafe: {
    /**
     * A set of bindings that should be put into a Worker's upload metadata without changes. These
     * can be used to implement bindings for features that haven't released and aren't supported
     * directly by wrangler or miniflare.
     */
    bindings?: {
      name: string;
      type: string;
      [key: string]: unknown;
    }[];
    /**
     * Arbitrary key/value pairs that will be included in the uploaded metadata.  Values specified
     * here will always be applied to metadata last, so can add new or override existing fields.
     */
    metadata?: {
      [key: string]: unknown;
    };
    /**
     * Used for internal capnp uploads for the Workers runtime
     */
    capnp?: {
      base_path: string;
      source_schemas: string[];
      compiled_schema?: never;
    } | {
      base_path?: never;
      source_schemas?: never;
      compiled_schema: string;
    };
  };
  /**
   * Specifies a list of mTLS certificates that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#mtls-certificates
   *
   * @default []
   * @nonInheritable
   */
  mtls_certificates: {
    /** The binding name used to refer to the certificate in the Worker */binding: string; /** The uuid of the uploaded mTLS certificate */
    certificate_id: string; /** Whether the mtls fetcher should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  }[];
  /**
   * Specifies a list of Tail Workers that are bound to this Worker environment
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default []
   * @nonInheritable
   */
  tail_consumers?: TailConsumer[];
  /**
   * Specifies namespace bindings that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * For reference, see https://developers.cloudflare.com/workers/wrangler/configuration/#dispatch-namespace-bindings-workers-for-platforms
   *
   * @default []
   * @nonInheritable
   */
  dispatch_namespaces: {
    /** The binding name used to refer to the bound service. */binding: string; /** The namespace to bind to. */
    namespace: string; /** Details about the outbound Worker which will handle outbound requests from your namespace */
    outbound?: DispatchNamespaceOutbound; /** Whether the Dispatch Namespace should be remote or not (only available under `--x-remote-bindings`) */
    experimental_remote?: boolean;
  }[];
  /**
   * Specifies list of Pipelines bound to this Worker environment
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default []
   * @nonInheritable
   */
  pipelines: {
    /** The binding name used to refer to the bound service. */binding: string; /** Name of the Pipeline to bind */
    pipeline: string;
  }[];
  /**
   * Specifies Secret Store bindings that are bound to this Worker environment.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default []
   * @nonInheritable
   */
  secrets_store_secrets: {
    /** The binding name used to refer to the bound service. */binding: string; /** Id of the secret store */
    store_id: string; /** Name of the secret */
    secret_name: string;
  }[];
  /**
   * **DO NOT USE**. Hello World Binding Config to serve as an explanatory example.
   *
   * NOTE: This field is not automatically inherited from the top level environment,
   * and so must be specified in every named environment.
   *
   * @default []
   * @nonInheritable
   */
  unsafe_hello_world: {
    /** The binding name used to refer to the bound service. */binding: string; /** Whether the timer is enabled */
    enable_timer?: boolean;
  }[];
}
/**
 * A bundling resolver rule, defining the modules type for paths that match the specified globs.
 */
type Rule = {
  type: ConfigModuleRuleType;
  globs: string[];
  fallthrough?: boolean;
};
/**
 * The possible types for a `Rule`.
 */
type ConfigModuleRuleType = "ESModule" | "CommonJS" | "CompiledWasm" | "Text" | "Data" | "PythonModule" | "PythonRequirement";
type TailConsumer = {
  /** The name of the service tail events will be forwarded to. */service: string; /** (Optional) The environment of the service. */
  environment?: string;
};
interface DispatchNamespaceOutbound {
  /** Name of the service handling the outbound requests */
  service: string;
  /** (Optional) Name of the environment handling the outbound requests. */
  environment?: string;
  /** (Optional) List of parameter names, for sending context from your dispatch Worker to the outbound handler */
  parameters?: string[];
}
interface UserLimits {
  /** Maximum allowed CPU time for a Worker's invocation in milliseconds */
  cpu_ms: number;
}
type Assets = {
  /** Absolute path to assets directory */directory?: string; /** Name of `env` binding property in the User Worker. */
  binding?: string; /** How to handle HTML requests. */
  html_handling?: "auto-trailing-slash" | "force-trailing-slash" | "drop-trailing-slash" | "none"; /** How to handle requests that do not match an asset. */
  not_found_handling?: "single-page-application" | "404-page" | "none";
  /**
   * Matches will be routed to the User Worker, and matches to negative rules will go to the Asset Worker.
   *
   * Can also be `true`, indicating that every request should be routed to the User Worker.
   */
  run_worker_first?: string[] | boolean;
};
interface Observability {
  /** If observability is enabled for this Worker */
  enabled?: boolean;
  /** The sampling rate */
  head_sampling_rate?: number;
  logs?: {
    enabled?: boolean; /** The sampling rate */
    head_sampling_rate?: number; /** Set to false to disable invocation logs */
    invocation_logs?: boolean;
  };
  traces?: {
    enabled?: boolean; /** The sampling rate */
    head_sampling_rate?: number;
  };
}
/**
 * This is the static type definition for the configuration object.
 *
 * It reflects a normalized and validated version of the configuration that you can write in a Wrangler configuration file,
 * and optionally augment with arguments passed directly to wrangler.
 *
 * For more information about the configuration object, see the
 * documentation at https://developers.cloudflare.com/workers/cli-wrangler/configuration
 *
 * Notes:
 *
 * - Fields that are only specified in `ConfigFields` and not `Environment` can only appear
 * in the top level config and should not appear in any environments.
 * - Fields that are specified in `PagesConfigFields` are only relevant for Pages projects
 * - All top level fields in config and environments are optional in the Wrangler configuration file.
 *
 * Legend for the annotations:
 *
 * - `@breaking`: the deprecation/optionality is a breaking change from Wrangler v1.
 * - `@todo`: there's more work to be done (with details attached).
 */
type Config = ComputedFields & ConfigFields<DevConfig> & PagesConfigFields & Environment;
interface ComputedFields {
  /** The path to the Wrangler configuration file (if any, and possibly redirected from the user Wrangler configuration) used to create this configuration. */
  configPath: string | undefined;
  /** The path to the user's Wrangler configuration file (if any), which may have been redirected to another file that used to create this configuration. */
  userConfigPath: string | undefined;
  /**
   * The original top level name for the Worker in the raw configuration.
   *
   * When a raw configuration has been flattened to a single environment the worker name may have been replaced or transformed.
   * It can be useful to know what the top-level name was before the flattening.
   */
  topLevelName: string | undefined;
}
interface ConfigFields<Dev extends RawDevConfig> {
  /**
   * A boolean to enable "legacy" style wrangler environments (from Wrangler v1).
   * These have been superseded by Services, but there may be projects that won't
   * (or can't) use them. If you're using a legacy environment, you can set this
   * to `true` to enable it.
   */
  legacy_env: boolean;
  /**
   * Whether Wrangler should send usage metrics to Cloudflare for this project.
   *
   * When defined this will override any user settings.
   * Otherwise, Wrangler will use the user's preference.
   */
  send_metrics: boolean | undefined;
  /**
   * Options to configure the development server that your worker will use.
   */
  dev: Dev;
  /**
   * The definition of a Worker Site, a feature that lets you upload
   * static assets with your Worker.
   *
   * More details at https://developers.cloudflare.com/workers/platform/sites
   */
  site: {
    /**
     * The directory containing your static assets.
     *
     * It must be a path relative to your Wrangler configuration file.
     * Example: bucket = "./public"
     *
     * If there is a `site` field then it must contain this `bucket` field.
     */
    bucket: string;
    /**
     * The location of your Worker script.
     *
     * @deprecated DO NOT use this (it's a holdover from Wrangler v1.x). Either use the top level `main` field, or pass the path to your entry file as a command line argument.
     * @breaking
     */
    "entry-point"?: string;
    /**
     * An exclusive list of .gitignore-style patterns that match file
     * or directory names from your bucket location. Only matched
     * items will be uploaded. Example: include = ["upload_dir"]
     *
     * @optional
     * @default []
     */
    include?: string[];
    /**
     * A list of .gitignore-style patterns that match files or
     * directories in your bucket that should be excluded from
     * uploads. Example: exclude = ["ignore_dir"]
     *
     * @optional
     * @default []
     */
    exclude?: string[];
  } | undefined;
  /**
   * Old behaviour of serving a folder of static assets with your Worker,
   * without any additional code.
   * This can either be a string, or an object with additional config
   * fields.
   * Will be deprecated in the near future in favor of `assets`.
   */
  legacy_assets: {
    bucket: string;
    include: string[];
    exclude: string[];
    browser_TTL: number | undefined;
    serve_single_page_app: boolean;
  } | string | undefined;
  /**
   * A list of wasm modules that your worker should be bound to. This is
   * the "legacy" way of binding to a wasm module. ES module workers should
   * do proper module imports.
   */
  wasm_modules: {
    [key: string]: string;
  } | undefined;
  /**
   * A list of text files that your worker should be bound to. This is
   * the "legacy" way of binding to a text file. ES module workers should
   * do proper module imports.
   */
  text_blobs: {
    [key: string]: string;
  } | undefined;
  /**
   * A list of data files that your worker should be bound to. This is
   * the "legacy" way of binding to a data file. ES module workers should
   * do proper module imports.
   */
  data_blobs: {
    [key: string]: string;
  } | undefined;
  /**
   * A map of module aliases. Lets you swap out a module for any others.
   * Corresponds with esbuild's `alias` config
   */
  alias: {
    [key: string]: string;
  } | undefined;
  /**
   * By default, the Wrangler configuration file is the source of truth for your environment configuration, like a terraform file.
   *
   * If you change your vars in the dashboard, wrangler *will* override/delete them on its next deploy.
   *
   * If you want to keep your dashboard vars when wrangler deploys, set this field to true.
   *
   * @default false
   * @nonInheritable
   */
  keep_vars?: boolean;
}
interface PagesConfigFields {
  /**
   * The directory of static assets to serve.
   *
   * The presence of this field in a Wrangler configuration file indicates a Pages project,
   * and will prompt the handling of the configuration file according to the
   * Pages-specific validation rules.
   */
  pages_build_output_dir?: string;
}
interface DevConfig {
  /**
   * IP address for the local dev server to listen on,
   *
   * @default localhost
   */
  ip: string;
  /**
   * Port for the local dev server to listen on
   *
   * @default 8787
   */
  port: number | undefined;
  /**
   * Port for the local dev server's inspector to listen on
   *
   * @default 9229
   */
  inspector_port: number | undefined;
  /**
   * Protocol that local wrangler dev server listens to requests on.
   *
   * @default http
   */
  local_protocol: "http" | "https";
  /**
   * Protocol that wrangler dev forwards requests on
   *
   * Setting this to `http` is not currently implemented for remote mode.
   * See https://github.com/cloudflare/workers-sdk/issues/583
   *
   * @default https
   */
  upstream_protocol: "https" | "http";
  /**
   * Host to forward requests to, defaults to the host of the first route of project
   */
  host: string | undefined;
}
type RawDevConfig = Partial<DevConfig>;
type WranglerConfig = Partial<Omit<Config, keyof ComputedFields>>;
/**
 * https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
 */
interface CloudflarePagesRoutes {
  /** Defines the version of the schema. Currently there is only one version of the schema (version 1), however, we may add more in the future and aim to be backwards compatible. */
  version?: 1;
  /** Defines routes that will be invoked by Functions. Accepts wildcard behavior. */
  include?: string[];
  /** Defines routes that will not be invoked by Functions. Accepts wildcard behavior. `exclude` always take priority over `include`. */
  exclude?: string[];
}
interface CloudflareOptions {
  /**
   * Configuration for the Cloudflare Deployments.
   *
   * **NOTE:** This option is only effective if `deployConfig` is enabled.
   */
  wrangler?: WranglerConfig;
  /**
   * Enable automatic generation of `.wrangler/deploy/config.json`.
   *
   * **IMPORTANT:** Enabling this option will cause settings from cloudflare dashboard (including environment variables) to be disabled and discarded.
   *
   * More info: https://developers.cloudflare.com/workers/wrangler/configuration#generated-wrangler-configuration
   */
  deployConfig?: boolean;
  /**
   * Enable native Node.js compatibility support.
   *
   * If this option disabled, pure unenv polyfills will be used instead.
   *
   * If not set, will be auto enabled if `nodejs_compat` or `nodejs_compat_v2` is detected in `wrangler.toml` or `wrangler.json`.
   */
  nodeCompat?: boolean;
  /**
   * Options for dev emulation.
   */
  dev?: {
    configPath?: string;
    environment?: string;
    persistDir?: string;
  };
  pages?: {
    /**
     * Nitro will automatically generate a `_routes.json` that controls which files get served statically and
     * which get served by the Worker. Using this config will override the automatic `_routes.json`. Or, if the
     * `merge` options is set, it will merge the user-set routes with the auto-generated ones, giving priority
     * to the user routes.
     *
     * @see https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
     *
     * There are a maximum of 100 rules, and you must have at least one include rule. Wildcards are accepted.
     *
     * If any fields are unset, they default to:
     *
     * ```json
     * {
     *   "version": 1,
     *   "include": ["/*"],
     *   "exclude": []
     * }
     * ```
     */
    routes?: CloudflarePagesRoutes;
    /**
     * If set to `false`, nitro will disable the automatically generated `_routes.json` and instead use the user-set only ones.
     *
     * @default true
     */
    defaultRoutes?: boolean;
  };
  /**
   * Custom Cloudflare exports additional classes such as WorkflowEntrypoint.
   */
  exports?: string;
}
type DurableObjectState = ConstructorParameters<typeof DurableObject>[0];
declare module "nitro/types" {
  interface NitroRuntimeHooks {
    "cloudflare:scheduled": (_: {
      controller: ScheduledController;
      env: unknown;
      context: ExecutionContext;
    }) => void;
    "cloudflare:email": (_: {
      message: ForwardableEmailMessage; /** @deprecated please use `message` */
      event: ForwardableEmailMessage;
      env: unknown;
      context: ExecutionContext;
    }) => void;
    "cloudflare:queue": (_: {
      batch: MessageBatch; /** @deprecated please use `batch` */
      event: MessageBatch;
      env: unknown;
      context: ExecutionContext;
    }) => void;
    "cloudflare:tail": (_: {
      traces: TraceItem[];
      env: unknown;
      context: ExecutionContext;
    }) => void;
    "cloudflare:trace": (_: {
      traces: TraceItem[];
      env: unknown;
      context: ExecutionContext;
    }) => void;
    "cloudflare:durable:init": (durable: DurableObject, _: {
      state: DurableObjectState;
      env: unknown;
    }) => void;
    "cloudflare:durable:alarm": (durable: DurableObject) => void;
  }
}
interface FirebaseOptions {
  appHosting: Partial<AppHostingOutputBundleConfig["runConfig"]>;
}
interface AppHostingOutputBundleConfig {
  version: "v1";
  runConfig: {
    /** Command to start the server (e.g. "node dist/index.js"). Assume this command is run from the root dir of the workspace. */runCommand: string; /** Environment variables set when the app is run. */
    environmentVariables?: Array<{
      /** Name of the variable. */variable: string; /** Value associated with the variable. */
      value: string; /** Where the variable will be available, for now only RUNTIME is supported. */
      availability: "RUNTIME"[];
    }>; /** The maximum number of concurrent requests that each server instance can receive. */
    concurrency?: number; /** The number of CPUs used in a single server instance. */
    cpu?: number; /** The amount of memory available for a server instance. */
    memoryMiB?: number; /** The limit on the minimum number of function instances that may coexist at a given time. */
    minInstances?: number; /** The limit on the maximum number of function instances that may coexist at a given time. */
    maxInstances?: number;
  };
  metadata: {
    adapterPackageName: string;
    adapterVersion: string;
    framework: string;
    frameworkVersion?: string;
  };
  outputFiles?: {
    /** serverApp holds a list of directories + files relative to the app root dir that frameworks need to deploy to the App Hosting server. */serverApp: {
      include: string[];
    };
  };
}
interface NetlifyOptions {
  /** @deprecated Use `config.images` */
  images?: NetlifyImagesConfig;
  config?: NetlifyConfigJson;
}
interface NetlifyConfigJson {
  edge_functions?: NetlifyEdgeFunctionDeclaration[];
  functions?: NetlifyFunctionsConfig | NetlifyFunctionsConfigByPattern;
  headers?: NetlifyHeaderRule[];
  images?: NetlifyImagesConfig;
  redirects?: NetlifyRedirectRule[];
  "redirects!"?: NetlifyRedirectRule[];
}
interface NetlifyEdgeFunctionDeclaration {
  function: string;
  path?: string;
  pattern?: string;
  excludedPath?: string;
  excludedPattern?: string;
  cache?: string;
  [key: string]: unknown;
}
interface NetlifyFunctionsConfig extends NetlifyFunctionInlineConfig {
  directory?: string;
}
type NetlifyFunctionsConfigByPattern = Record<string, NetlifyFunctionInlineConfig>;
interface NetlifyFunctionInlineConfig {
  included_files?: string[];
  [key: string]: unknown;
}
interface NetlifyHeaderRule {
  for: string;
  values: Record<string, string>;
  [key: string]: unknown;
}
interface NetlifyImagesConfig {
  remote_images?: string[];
  [key: string]: unknown;
}
interface NetlifyRedirectRule {
  from: string;
  to: string;
  status?: number;
  force?: boolean;
  conditions?: Record<string, string[]>;
  query?: Record<string, string>;
  [key: string]: unknown;
}
/**
 * Vercel Build Output Configuration
 * @see https://vercel.com/docs/build-output-api/v3
 */
interface VercelBuildConfigV3 {
  version: 3;
  routes?: ({
    src: string;
    dest?: string;
    headers?: Record<string, string>;
    continue?: boolean;
    status?: number;
  } | {
    handle: string;
  })[];
  images?: {
    sizes: number[];
    domains: string[];
    remotePatterns?: {
      protocol?: "http" | "https";
      hostname: string;
      port?: string;
      pathname?: string;
    }[];
    minimumCacheTTL?: number;
    formats?: ("image/avif" | "image/webp")[];
    dangerouslyAllowSVG?: boolean;
    contentSecurityPolicy?: string;
  };
  wildcard?: Array<{
    domain: string;
    value: string;
  }>;
  overrides?: Record<string, {
    path?: string;
    contentType?: string;
  }>;
  cache?: string[];
  bypassToken?: string;
  framework?: {
    version: string;
  };
  crons?: {
    path: string;
    schedule: string;
  }[];
}
/**
 * https://vercel.com/docs/build-output-api/primitives#serverless-function-configuration
 * https://vercel.com/docs/build-output-api/primitives#node.js-config
 */
interface VercelServerlessFunctionConfig {
  /**
   * Amount of memory (RAM in MB) that will be allocated to the Serverless Function.
   */
  memory?: number;
  /**
   * Specifies the instruction set "architecture" the Vercel Function supports.
   *
   * Either `x86_64` or `arm64`. The default value is `x86_64`
   */
  architecture?: "x86_64" | "arm64";
  /**
   * Maximum execution duration (in seconds) that will be allowed for the Serverless Function. `max` automatically sets the duration to the maximum allowed value.
   */
  maxDuration?: number | "max";
  /**
   * Map of additional environment variables that will be available to the Vercel Function,
   * in addition to the env vars specified in the Project Settings.
   */
  environment?: Record<string, string>;
  /**
   * List of Vercel Regions where the Vercel Function will be deployed to.
   */
  regions?: string[];
  /**
   * True if a custom runtime has support for Lambda runtime wrappers.
   */
  supportsWrapper?: boolean;
  /**
   * When true, the Serverless Function will stream the response to the client.
   */
  supportsResponseStreaming?: boolean;
  /**
   * Enables source map generation.
   */
  shouldAddSourcemapSupport?: boolean;
  /**
   * The runtime to use. Defaults to the auto-detected Node.js version.
   */
  runtime?: "nodejs20.x" | "nodejs22.x" | "bun1.x" | (string & {});
  /**
   * Experimental trigger configuration (e.g., Vercel Queues).
   */
  experimentalTriggers?: VercelFunctionTrigger[];
  [key: string]: unknown;
}
type VercelFunctionTrigger = {
  type: "queue/v2beta";
  topic: string;
  retryAfterSeconds?: number;
  initialDelaySeconds?: number;
  consumer?: string;
};
interface VercelOptions {
  config?: VercelBuildConfigV3;
  /**
   * If you have enabled skew protection in the Vercel dashboard, it will
   * be enabled by default.
   *
   * You can disable the Nitro integration by setting this option to `false`.
   */
  skewProtection?: boolean;
  /**
   * If you are using `vercel-edge`, you can specify the region(s) for your edge function.
   * @see https://vercel.com/docs/concepts/functions/edge-functions#edge-function-regions
   */
  regions?: string[];
  functions?: VercelServerlessFunctionConfig;
  /**
   * Handler format to use for Vercel Serverless Functions.
   *
   * Using `node` format enables compatibility with Node.js specific APIs in your Nitro application (e.g., `req.runtime.node`).
   *
   * Possible values are: `web` (default) and `node`.
   */
  entryFormat?: "web" | "node";
  /**
   * The route path for the Vercel cron handler endpoint.
   *
   * When `experimental.tasks` and `scheduledTasks` are configured,
   * Nitro registers a cron handler at this path that Vercel invokes
   * on each scheduled cron trigger.
   *
   * @default "/_vercel/cron"
   * @see https://vercel.com/docs/cron-jobs
   */
  cronHandlerRoute?: string;
  /**
   * Vercel Queues configuration.
   *
   * Messages are delivered via the `vercel:queue` runtime hook.
   *
   * @example
   * ```ts
   * // nitro.config.ts
   * export default defineNitroConfig({
   *   vercel: {
   *     queues: {
   *       triggers: [{ topic: "orders" }],
   *     },
   *   },
   * });
   * ```
   *
   * ```ts
   * // server/plugins/queues.ts
   * export default defineNitroPlugin((nitro) => {
   *   nitro.hooks.hook("vercel:queue", ({ message, metadata }) => {
   *     console.log(`Received message on ${metadata.topicName}:`, message);
   *   });
   * });
   * ```
   *
   * @see https://vercel.com/docs/queues
   */
  queues?: {
    /**
     * Route path for the queue consumer handler.
     * @default "/_vercel/queues/consumer"
     */
    handlerRoute?: string; /** Queue topic triggers to subscribe to. */
    triggers: Array<{
      topic: string;
      retryAfterSeconds?: number;
      initialDelaySeconds?: number;
    }>;
  };
  /**
   * Per-route function configuration overrides.
   *
   * Keys are route patterns (e.g., `/api/queues/*`, `/api/slow-routes/**`).
   * Values are partial {@link VercelServerlessFunctionConfig} objects.
   *
   * @example
   * ```ts
   * functionRules: {
   *   '/api/my-slow-routes/**': { maxDuration: 3600 },
   *   '/api/queues/fulfill-order': {
   *     experimentalTriggers: [{ type: 'queue/v2beta', topic: 'orders' }],
   *   },
   * }
   * ```
   */
  functionRules?: Record<string, VercelServerlessFunctionConfig>;
}
declare module "nitro/types" {
  interface NitroRuntimeHooks {
    "vercel:queue": (_: {
      message: unknown;
      metadata: _$_vercel_queue0.MessageMetadata;
      send: typeof send;
    }) => void;
  }
}
interface ZephyrOptions {
  /**
   * Deploy to Zephyr during `nitro build` when using the `zephyr` preset.
   *
   * @default false
   */
  deployOnBuild?: boolean;
}
interface PresetOptions {
  awsAmplify?: AWSAmplifyOptions;
  awsLambda?: AwsLambdaOptions;
  azure?: AzureOptions;
  cloudflare?: CloudflareOptions;
  firebase?: FirebaseOptions;
  netlify?: NetlifyOptions;
  vercel?: VercelOptions;
  zephyr?: ZephyrOptions;
}
type PresetName = "alwaysdata" | "aws-amplify" | "aws-lambda" | "azure-swa" | "base-worker" | "bun" | "cleavr" | "cloudflare-dev" | "cloudflare-durable" | "cloudflare-module" | "cloudflare-pages" | "cloudflare-pages-static" | "deno" | "deno-deploy" | "deno-server" | "digital-ocean" | "edgeone" | "edgeone-pages" | "firebase-app-hosting" | "flight-control" | "genezio" | "github-pages" | "gitlab-pages" | "heroku" | "iis-handler" | "iis-node" | "koyeb" | "netlify" | "netlify-edge" | "netlify-static" | "nitro-dev" | "nitro-prerender" | "node" | "node-cluster" | "node-middleware" | "node-server" | "platform-sh" | "render-com" | "standard" | "static" | "stormkit" | "vercel" | "vercel-static" | "winterjs" | "zeabur" | "zeabur-static" | "zephyr" | "zerops" | "zerops-static";
type PresetNameInput = "alwaysdata" | "aws-amplify" | "awsAmplify" | "aws_amplify" | "aws-lambda" | "awsLambda" | "aws_lambda" | "azure-swa" | "azureSwa" | "azure_swa" | "base-worker" | "baseWorker" | "base_worker" | "bun" | "cleavr" | "cloudflare-dev" | "cloudflareDev" | "cloudflare_dev" | "cloudflare-durable" | "cloudflareDurable" | "cloudflare_durable" | "cloudflare-module" | "cloudflareModule" | "cloudflare_module" | "cloudflare-pages" | "cloudflarePages" | "cloudflare_pages" | "cloudflare-pages-static" | "cloudflarePagesStatic" | "cloudflare_pages_static" | "deno" | "deno-deploy" | "denoDeploy" | "deno_deploy" | "deno-server" | "denoServer" | "deno_server" | "digital-ocean" | "digitalOcean" | "digital_ocean" | "edgeone" | "edgeone-pages" | "edgeonePages" | "edgeone_pages" | "firebase-app-hosting" | "firebaseAppHosting" | "firebase_app_hosting" | "flight-control" | "flightControl" | "flight_control" | "genezio" | "github-pages" | "githubPages" | "github_pages" | "gitlab-pages" | "gitlabPages" | "gitlab_pages" | "heroku" | "iis-handler" | "iisHandler" | "iis_handler" | "iis-node" | "iisNode" | "iis_node" | "koyeb" | "netlify" | "netlify-edge" | "netlifyEdge" | "netlify_edge" | "netlify-static" | "netlifyStatic" | "netlify_static" | "nitro-dev" | "nitroDev" | "nitro_dev" | "nitro-prerender" | "nitroPrerender" | "nitro_prerender" | "node" | "node-cluster" | "nodeCluster" | "node_cluster" | "node-middleware" | "nodeMiddleware" | "node_middleware" | "node-server" | "nodeServer" | "node_server" | "platform-sh" | "platformSh" | "platform_sh" | "render-com" | "renderCom" | "render_com" | "standard" | "static" | "stormkit" | "vercel" | "vercel-static" | "vercelStatic" | "vercel_static" | "winterjs" | "zeabur" | "zeabur-static" | "zeaburStatic" | "zeabur_static" | "zephyr" | "zerops" | "zerops-static" | "zeropsStatic" | "zerops_static" | (string & {});
/**
Source: (inlined because of install size concernes)

https://github.com/openapi-ts/openapi-typescript/blob/fc3f7/packages/openapi-typescript/src/types.ts

MIT License

Copyright (c) 2020 Drew Powers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
interface Extensable {
  [key: `x-${string}`]: any;
}
/**
 * [4.8] Schema
 * @see https://spec.openapis.org/oas/v3.1.0#schema
 */
interface OpenAPI3 extends Extensable {
  /** REQUIRED. This string MUST be the version number of the OpenAPI Specification that the OpenAPI document uses. The openapi field SHOULD be used by tooling to interpret the OpenAPI document. This is not related to the API info.version string. */
  openapi: string;
  /** REQUIRED. Provides metadata about the API. The metadata MAY be used by tooling as required. */
  info: InfoObject;
  /** The default value for the $schema keyword within Schema Objects contained within this OAS document. This MUST be in the form of a URI. */
  jsonSchemaDialect?: string;
  /** An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /. */
  servers?: ServerObject[];
  /** The available paths and operations for the API. */
  paths?: PathsObject;
  /** The incoming webhooks that MAY be received as part of this API and that the API consumer MAY choose to implement. Closely related to the callbacks feature, this section describes requests initiated other than by an API call, for example by an out of band registration. The key name is a unique string to refer to each webhook, while the (optionally referenced) Path Item Object describes a request that may be initiated by the API provider and the expected responses. An example is available. */
  webhooks?: {
    [id: string]: PathItemObject | ReferenceObject;
  };
  /** An element to hold various schemas for the document. */
  components?: ComponentsObject;
  /** A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array. */
  security?: SecurityRequirementObject[];
  /** A list of tags used by the document with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools’ logic. Each tag name in the list MUST be unique. */
  tags?: TagObject[];
  /** Additional external documentation. */
  externalDocs?: ExternalDocumentationObject;
  $defs?: $defs;
}
/**
 * [4.8.2] Info Object
 * The object provides metadata about the API.
 */
interface InfoObject extends Extensable {
  /** REQUIRED. The title of the API. */
  title: string;
  /** A short summary of the API. */
  summary?: string;
  /** A description of the API. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** A URL to the Terms of Service for the API. This MUST be in the form of a URL. */
  termsOfService?: string;
  /** The contact information for the exposed API. */
  contact?: ContactObject;
  /** The license information for the exposed API. */
  license?: LicenseObject;
  /** REQUIRED. The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version). */
  version: string;
}
/**
 * [4.8.3] Contact Object
 * Contact information for the exposed API.
 */
interface ContactObject extends Extensable {
  /** The identifying name of the contact person/organization. */
  name?: string;
  /** The URL pointing to the contact information. This MUST be in the form of a URL. */
  url?: string;
  /** The email address of the contact person/organization. This MUST be in the form of an email address. */
  email?: string;
}
/**
 * [4.8.4] License object
 * License information for the exposed API.
 */
interface LicenseObject extends Extensable {
  /** REQUIRED. The license name used for the API. */
  name: string;
  /** An SPDX license expression for the API. The identifier field is mutually exclusive of the url field. */
  identifier: string;
  /** A URL to the license used for the API. This MUST be in the form of a URL. The url field is mutually exclusive of the identifier field. */
  url: string;
}
/**
 * [4.8.5] Server Object
 * An object representing a Server.
 */
interface ServerObject extends Extensable {
  /** REQUIRED. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in {brackets}. */
  url: string;
  /** An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation. */
  description: string;
  /** A map between a variable name and its value. The value is used for substitution in the server’s URL template. */
  variables: {
    [name: string]: ServerVariableObject;
  };
}
/**
 * [4.8.6] Server Variable Object
 * An object representing a Server Variable for server URL template substitution.
 */
interface ServerVariableObject extends Extensable {
  /** An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty. */
  enum?: string[];
  /** REQUIRED. The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. Note this behavior is different than the Schema Object’s treatment of default values, because in those cases parameter values are optional. If the enum is defined, the value MUST exist in the enum’s values. */
  default: string;
  /** An optional description for the server variable. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
}
/**
 * [4.8.7] Components Object
 * Holds a set of reusable objects for different aspects of the OAS.
 */
interface ComponentsObject extends Extensable {
  /** An object to hold reusable Schema Objects.*/
  schemas?: Record<string, SchemaObject>;
  /** An object to hold reusable Response Objects. */
  responses?: Record<string, ResponseObject | ReferenceObject>;
  /** An object to hold reusable Parameter Objects. */
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  /** An object to hold reusable Example Objects. */
  examples?: Record<string, ExampleObject | ReferenceObject>;
  /** An object to hold reusable Request Body Objects. */
  requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
  /** An object to hold reusable Header Objects. */
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /** An object to hold reusable Security Scheme Objects. */
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
  /** An object to hold reusable Link Objects. */
  links?: Record<string, LinkObject | ReferenceObject>;
  /** An object to hold reusable Callback Objects. */
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
  /** An object to hold reusable Path Item Objects. */
  pathItems?: Record<string, PathItemObject | ReferenceObject>;
}
/**
 * [4.8.8] Paths Object
 * Holds the relative paths to the individual endpoints and their operations. The path is appended to the URL from the Server Object in order to construct the full URL. The Paths MAY be empty, due to Access Control List (ACL) constraints.
 */
interface PathsObject {
  [pathname: string]: PathItemObject | ReferenceObject;
}
/**
 * [4.8.9] Path Item Object
 * Describes the operations available on a single path. A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.
 */
interface PathItemObject extends Extensable {
  /** A definition of a GET operation on this path. */
  get?: OperationObject | ReferenceObject;
  /** A definition of a PUT operation on this path. */
  put?: OperationObject | ReferenceObject;
  /** A definition of a POST operation on this path. */
  post?: OperationObject | ReferenceObject;
  /** A definition of a DELETE operation on this path. */
  delete?: OperationObject | ReferenceObject;
  /** A definition of a OPTIONS operation on this path. */
  options?: OperationObject | ReferenceObject;
  /** A definition of a HEAD operation on this path. */
  head?: OperationObject | ReferenceObject;
  /** A definition of a PATCH operation on this path. */
  patch?: OperationObject | ReferenceObject;
  /** A definition of a TRACE operation on this path. */
  trace?: OperationObject | ReferenceObject;
  /** An alternative server array to service all operations in this path. */
  servers?: ServerObject[];
  /** A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object’s components/parameters. */
  parameters?: (ParameterObject | ReferenceObject)[];
}
/**
 * [4.8.10] Operation Object
 * Describes a single API operation on a path.
 */
interface OperationObject extends Extensable {
  /** A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier. */
  tags?: string[];
  /** A short summary of what the operation does. */
  summary?: string;
  /** A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** Additional external documentation for this operation. */
  externalDocs?: ExternalDocumentationObject;
  /** Unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is case-sensitive. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions. */
  operationId?: string;
  /** A list of parameters that are applicable for this operation. If a parameter is already defined at the Path Item, the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a name and location. The list can use the Reference Object to link to parameters that are defined at the OpenAPI Object’s components/parameters. */
  parameters?: (ParameterObject | ReferenceObject)[];
  /** The request body applicable for this operation. The requestBody is fully supported in HTTP methods where the HTTP 1.1 specification [RFC7231] has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague (such as GET, HEAD and DELETE), requestBody is permitted but does not have well-defined semantics and SHOULD be avoided if possible. */
  requestBody?: RequestBodyObject | ReferenceObject;
  /** The list of possible responses as they are returned from executing this operation. */
  responses?: ResponsesObject;
  /** A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a Callback Object that describes a request that may be initiated by the API provider and the expected responses. */
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
  /** Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is false. */
  deprecated?: boolean;
  /** A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. To make security optional, an empty security requirement ({}) can be included in the array. This definition overrides any declared top-level security. To remove a top-level security declaration, an empty array can be used. */
  security?: SecurityRequirementObject[];
  /** An alternative server array to service this operation. If an alternative server object is specified at the Path Item Object or Root level, it will be overridden by this value. */
  servers?: ServerObject[];
}
/**
 * [4.8.11] External Documentation Object
 * Allows referencing an external resource for extended documentation.
 */
interface ExternalDocumentationObject extends Extensable {
  /** A description of the target documentation. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** REQUIRED. The URL for the target documentation. This MUST be in the form of a URL. */
  url: string;
}
/**
 * [4.8.12] Parameter Object
 * Describes a single operation parameter.
 * A unique parameter is defined by a combination of a name and location.
 */
interface ParameterObject extends Extensable {
  /**
   * REQUIRED. The name of the parameter. Parameter names are case sensitive.
   *
   * - If `in` is `"path"`, the `name` field MUST correspond to a template expression occurring within the path field in the Paths Object. See Path Templating for further information.
   * - If `in` is `"header"` and the `name` field is `"Accept"`, `"Content-Type"` or `"Authorization"`, the parameter definition SHALL be ignored.
   * - For all other cases, the `name` corresponds to the parameter name used by the `in` property.
   */
  name: string;
  /** REQUIRED. The location of the parameter. Possible values are "query", "header", "path" or "cookie".*/
  in: "query" | "header" | "path" | "cookie";
  /** A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false. */
  required?: boolean;
  /** Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false. */
  deprecated?: boolean;
  /** Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision. */
  allowEmptyValue?: boolean;
  /** Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of in): for query - form; for path - simple; for header - simple; for cookie - form. */
  style?: string;
  /** When this is true, parameter values of type `array` or `object` generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this property has no effect. When `style` is `form`, the default value is `true`. For all other styles, the default value is `false`. */
  explode?: boolean;
  /** Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] `:/?#[]@!$&'()*+,;=` to be included without percent-encoding. This property only applies to parameters with an `in` value of `query`. The default value is `false`. */
  allowReserved?: boolean;
  /** The schema defining the type used for the parameter. */
  schema?: SchemaObject;
  /** Example of the parameter’s potential value. */
  example?: any;
  /** Examples of the parameter’s potential value. */
  examples?: {
    [name: string]: ExampleObject | ReferenceObject;
  };
  /** A map containing the representations for the parameter. */
  content?: {
    [contentType: string]: MediaTypeObject | ReferenceObject;
  };
}
/**
 * [4.8.13] Request Body Object
 * Describes a single request body.
 */
interface RequestBodyObject extends Extensable {
  /** A brief description of the request body. This could contain examples of use. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** REQUIRED. The content of the request body. The key is a media type or media type range and the value describes it. For requests that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text */
  content: {
    [contentType: string]: MediaTypeObject | ReferenceObject;
  };
  /** Determines if the request body is required in the request. Defaults to false. */
  required?: boolean;
}
/**
 * [4.8.14] Media Type Object
 */
interface MediaTypeObject extends Extensable {
  /** The schema defining the content of the request, response, or parameter. */
  schema?: SchemaObject | ReferenceObject;
  /** Example of the media type. The example object SHOULD be in the correct format as specified by the media type. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema which contains an example, the example value SHALL override the example provided by the schema. */
  example?: any;
  /** Examples of the media type. Each example object SHOULD match the media type and specified schema if present. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema which contains an example, the examples value SHALL override the example provided by the schema. */
  examples?: {
    [name: string]: ExampleObject | ReferenceObject;
  };
  /** A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded. */
  encoding?: {
    [propertyName: string]: EncodingObject;
  };
}
/**
 * [4.8.15] Encoding Object
 * A single encoding definition applied to a single schema property.
 */
interface EncodingObject extends Extensable {
  /** The Content-Type for encoding a specific property. Default value depends on the property type: for object - application/json; for array – the default is defined based on the inner type; for all other cases the default is application/octet-stream. The value can be a specific media type (e.g. application/json), a wildcard media type (e.g. image/*), or a comma-separated list of the two types. */
  contentType?: string;
  /** A map allowing additional information to be provided as headers, for example Content-Disposition. Content-Type is described separately and SHALL be ignored in this section. This property SHALL be ignored if the request body media type is not a multipart. */
  headers?: {
    [name: string]: HeaderObject | ReferenceObject;
  };
  /** Describes how a specific property value will be serialized depending on its type. See Parameter Object for details on the style property. The behavior follows the same values as query parameters, including default values. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored. */
  style?: string;
  /** When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this property has no effect. When style is form, the default value is true. For all other styles, the default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored. */
  explode?: string;
  /** Determines whether the parameter value SHOULD allow reserved characters, as defined by [RFC3986] :/?#[]@!$&'()*+,;= to be included without percent-encoding. The default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded or multipart/form-data. If a value is explicitly defined, then the value of contentType (implicit or explicit) SHALL be ignored. */
  allowReserved?: string;
}
/**
 * [4.8.16] Responses Object
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 */
type ResponsesObject = {
  [responseCode: string]: ResponseObject | ReferenceObject;
} & {
  /** The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses. */default?: ResponseObject | ReferenceObject;
};
/**
 * [4.8.17] Response Object
 * Describes a single response from an API Operation, including design-time, static links to operations based on the response.
 */
interface ResponseObject extends Extensable {
  /** REQUIRED. A description of the response. CommonMark syntax MAY be used for rich text representation. */
  description: string;
  /** Maps a header name to its definition. [RFC7230] states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored. */
  headers?: {
    [name: string]: HeaderObject | ReferenceObject;
  };
  /** A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text */
  content?: {
    [contentType: string]: MediaTypeObject;
  };
  /** A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects. */
  links?: {
    [name: string]: LinkObject | ReferenceObject;
  };
}
/**
 * [4.8.18] Callback Object
 * A map of possible out-of band callbacks related to the parent operation. Each value in the map is a Path Item Object that describes a set of requests that may be initiated by the API provider and the expected responses. The key value used to identify the path item object is an expression, evaluated at runtime, that identifies a URL to use for the callback operation.
 */
type CallbackObject = Record<string, PathItemObject>;
/**
 * [4.8.19[ Example Object
 */
interface ExampleObject extends Extensable {
  /** Short description for the example. */
  summary?: string;
  /** Long description for the example. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** Embedded literal example. The value field and externalValue field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary. */
  value?: any;
  /** A URI that points to the literal example. This provides the capability to reference examples that cannot easily be included in JSON or YAML documents. The value field and externalValue field are mutually exclusive. See the rules for resolving Relative References. */
  externalValue?: string;
}
/**
 * [4.8.20] Link Object
 * The Link object represents a possible design-time link for a response. The presence of a link does not guarantee the caller’s ability to successfully invoke it, rather it provides a known relationship and traversal mechanism between responses and other operations.
 */
interface LinkObject extends Extensable {
  /** A relative or absolute URI reference to an OAS operation. This field is mutually exclusive of the operationId field, and MUST point to an Operation Object. Relative operationRef values MAY be used to locate an existing Operation Object in the OpenAPI definition. See the rules for resolving Relative References. */
  operationRef?: string;
  /** The name of an existing, resolvable OAS operation, as defined with a unique operationId. This field is mutually exclusive of the operationRef field. */
  operationId?: string;
  /** A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. The key is the parameter name to be used, whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. The parameter name can be qualified using the parameter location [{in}.]{name} for operations that use the same parameter name in different locations (e.g. path.id). */
  parameters?: {
    [name: string]: `$${string}`;
  };
  /** A literal value or {expression} to use as a request body when calling the target operation. */
  requestBody?: `$${string}`;
  /** A description of the link. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** A server object to be used by the target operation. */
  server?: ServerObject;
}
/**
 * [4.8.21] Header Object
 * The Header Object follows the structure of the Parameter Object with the following changes:
 *
 * 1. `name` MUST NOT be specified, it is given in the corresponding `headers` map.
 * 2. `in` MUST NOT be specified, it is implicitly in `header`.
 * 3. All traits that are affected by the location MUST be applicable to a location of `heade`r (for example, `style`).
 */
type HeaderObject = Omit<ParameterObject, "name" | "in">;
/**
 * [4.8.22] Tag Object
 * Adds metadata to a single tag that is used by the Operation Object. It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.
 */
interface TagObject extends Extensable {
  /** REQUIRED. The name of the tag. */
  name: string;
  /** A description for the tag. CommonMark syntax MAY be used for rich text representation. */
  description?: string;
  /** Additional external documentation for this tag. */
  externalDocs?: ExternalDocumentationObject;
}
/**
 * [4.8.23] Reference Object
 * A simple object to allow referencing other components in the OpenAPI document, internally and externally. The $ref string value contains a URI [RFC3986], which identifies the location of the value being referenced. See the rules for resolving Relative References.
 */
interface ReferenceObject extends Extensable {
  /** REQUIRED. The reference identifier. This MUST be in the form of a URI. */
  $ref: string;
  /** A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a summary field, then this field has no effect. */
  summary?: string;
  /** A description which by default SHOULD override that of the referenced component. CommonMark syntax MAY be used for rich text representation. If the referenced object-type does not allow a description field, then this field has no effect. */
  description?: string;
}
/**
 * [4.8.24] Schema Object
 * The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is a superset of the JSON Schema Specification Draft 2020-12.
 */
type SchemaObject = {
  /** The Schema Object allows the definition of input and output data types. These types can be objects, but also primitives and arrays. This object is a superset of the JSON Schema Specification Draft 2020-12. */discriminator?: DiscriminatorObject; /** MAY be used only on properties schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property. */
  xml?: XMLObject; /** Additional external documentation for this schema. */
  externalDocs?: ExternalDocumentationObject; /** @deprecated */
  example?: any;
  title?: string;
  description?: string;
  $comment?: string;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  enum?: unknown[]; /** Use of this keyword is functionally equivalent to an "enum" (Section 6.1.2) with a single value. */
  const?: unknown;
  default?: unknown;
  format?: string; /** @deprecated in 3.1 (still valid for 3.0) */
  nullable?: boolean;
  oneOf?: (SchemaObject | ReferenceObject)[];
  allOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  required?: string[];
  [key: `x-${string}`]: any;
} & (StringSubtype | NumberSubtype | IntegerSubtype | ArraySubtype | BooleanSubtype | NullSubtype | ObjectSubtype | {
  type: ("string" | "number" | "integer" | "array" | "boolean" | "null" | "object")[];
});
interface StringSubtype {
  type: "string" | ["string", "null"];
  enum?: (string | ReferenceObject)[];
}
interface NumberSubtype {
  type: "number" | ["number", "null"];
  minimum?: number;
  maximum?: number;
  enum?: (number | ReferenceObject)[];
}
interface IntegerSubtype {
  type: "integer" | ["integer", "null"];
  minimum?: number;
  maximum?: number;
  enum?: (number | ReferenceObject)[];
}
interface ArraySubtype {
  type: "array" | ["array", "null"];
  prefixItems?: (SchemaObject | ReferenceObject)[];
  items?: SchemaObject | ReferenceObject | (SchemaObject | ReferenceObject)[];
  minItems?: number;
  maxItems?: number;
  enum?: (SchemaObject | ReferenceObject)[];
}
interface BooleanSubtype {
  type: "boolean" | ["boolean", "null"];
  enum?: (boolean | ReferenceObject)[];
}
interface NullSubtype {
  type: "null";
}
interface ObjectSubtype {
  type: "object" | ["object", "null"];
  properties?: {
    [name: string]: SchemaObject | ReferenceObject;
  };
  additionalProperties?: boolean | Record<string, never> | SchemaObject | ReferenceObject;
  required?: string[];
  allOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  enum?: (SchemaObject | ReferenceObject)[];
  $defs?: $defs;
}
/**
 * [4.8.25] Discriminator Object
 * When request bodies or response payloads may be one of a number of different schemas, a discriminator object can be used to aid in serialization, deserialization, and validation. The discriminator is a specific object in a schema which is used to inform the consumer of the document of an alternative schema based on the value associated with it.
 */
interface DiscriminatorObject {
  /** REQUIRED. The name of the property in the payload that will hold the discriminator value. */
  propertyName: string;
  /** An object to hold mappings between payload values and schema names or references. */
  mapping?: Record<string, string>;
  /** If this exists, then a discriminator type should be added to objects matching this path */
  oneOf?: string[];
}
/**
 * [4.8.26] XML Object
 * A metadata object that allows for more fine-tuned XML model definitions. When using arrays, XML element names are not inferred (for singular/plural forms) and the `name` property SHOULD be used to add that information. See examples for expected behavior.
 */
interface XMLObject extends Extensable {
  /** Replaces the name of the element/attribute used for the described schema property. When defined within `items`, it will affect the name of the individual XML elements within the list. When defined alongside `type` being `array` (outside the `items`), it will affect the wrapping element and only if `wrapped` is `true`. If `wrapped` is `false`, it will be ignored. */
  name?: string;
  /** The URI of the namespace definition. This MUST be in the form of an absolute URI. */
  namespace?: string;
  /** The prefix to be used for the name. */
  prefix?: string;
  /** Declares whether the property definition translates to an attribute instead of an element. Default value is `false`. */
  attribute?: boolean;
  /** MAY be used only for an array definition. Signifies whether the array is wrapped (for example, `<books><book/><book/></books>`) or unwrapped (`<book/><book/>`). Default value is `false`. The definition takes effect only when defined alongside `type` being `array` (outside the `items`). */
  wrapped?: boolean;
}
/**
 * [4.8.27] Security Scheme Object
 * Defines a security scheme that can be used by the operations.
 */
type SecuritySchemeObject = {
  /** A description for security scheme. CommonMark syntax MAY be used for rich text representation. */description?: string;
  [key: `x-${string}`]: any;
} & ({
  /** REQUIRED. The type of the security scheme. */type: "apiKey"; /** REQUIRED. The name of the header, query or cookie parameter to be used. */
  name: string; /** REQUIRED. The location of the API key. */
  in: "query" | "header" | "cookie";
} | {
  /** REQUIRED. The type of the security scheme. */type: "http"; /** REQUIRED. The name of the HTTP Authorization scheme to be used in the Authorization header as defined in [RFC7235]. The values used SHOULD be registered in the IANA Authentication Scheme registry. */
  scheme: string; /** A hint to the client to identify how the bearer token is formatted. Bearer tokens are usually generated by an authorization server, so this information is primarily for documentation purposes. */
  bearer?: string;
} | {
  /** REQUIRED. The type of the security scheme. */type: "mutualTLS";
} | {
  /** REQUIRED. Tye type of the security scheme. */type: "oauth2"; /** REQUIRED. An object containing configuration information for the flow types supported. */
  flows: OAuthFlowsObject;
} | {
  /** REQUIRED. Tye type of the security scheme. */type: "openIdConnect"; /** REQUIRED. OpenId Connect URL to discover OAuth2 configuration values. This MUST be in the form of a URL. The OpenID Connect standard requires the use of TLS. */
  openIdConnectUrl: string;
});
/**
 * [4.8.26] OAuth Flows Object
 * Allows configuration of the supported OAuth Flows.
 */
interface OAuthFlowsObject extends Extensable {
  /** Configuration for the OAuth Implicit flow */
  implicit?: OAuthFlowObject;
  /** Configuration for the OAuth Resource Owner Password flow */
  password?: OAuthFlowObject;
  /** Configuration for the OAuth Client Credentials flow. Previously called `application` in OpenAPI 2.0. */
  clientCredentials?: OAuthFlowObject;
  /** Configuration for the OAuth Authorization Code flow. Previously called `accessCode` in OpenAPI 2.0. */
  authorizationCode?: OAuthFlowObject;
}
/**
 * [4.8.29] OAuth Flow Object
 * Configuration details for a supported OAuth Flow
 */
interface OAuthFlowObject extends Extensable {
  /** REQUIRED. The authorization URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. */
  authorizationUrl: string;
  /** REQUIRED. The token URL to be used for this flow. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. */
  tokenUrl: string;
  /** The URL to be used for obtaining refresh tokens. This MUST be in the form of a URL. The OAuth2 standard requires the use of TLS. */
  refreshUrl: string;
  /** REQUIRED. The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. The map MAY be empty. */
  scopes: {
    [name: string]: string;
  };
}
/**
 * [4.8.30] Security Requirements Object
 * Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.
 */
type SecurityRequirementObject = { [P in keyof ComponentsObject["securitySchemes"]]?: string[] };
type $defs = Record<string, SchemaObject>;
type MaybeArray$1<T> = T | T[];
/**
 * Route-level metadata attached to event handlers.
 *
 * @experimental
 * @see https://nitro.build/docs/routing
 */
interface NitroRouteMeta {
  openAPI?: OperationObject & {
    $global?: Pick<OpenAPI3, "components"> & Extensable;
  };
}
interface NitroHandlerCommon {
  /**
   * HTTP pathname pattern to match.
   *
   * @example "/test", "/api/:id", "/blog/**"
   */
  route: string;
  /**
   * HTTP method to match.
   */
  method?: HTTPMethod;
  /**
   * Run handler as a middleware before other route handlers.
   */
  middleware?: boolean;
  /**
   * Route metadata (e.g. OpenAPI operation info).
   */
  meta?: NitroRouteMeta;
}
/**
 * Handler module format.
 *
 * - `"web"` — standard Web API handler (default).
 * - `"node"` — Node.js-style handler, automatically converted to web-compatible.
 */
type EventHandlerFormat = "web" | "node";
/**
 * Event handler registration for build-time bundling.
 *
 * Handlers are file references that the bundler imports and transforms.
 * For runtime-only handlers in development, use {@link NitroDevEventHandler}.
 *
 * @see https://nitro.build/config#handlers
 * @see https://nitro.build/docs/routing
 */
interface NitroEventHandler extends NitroHandlerCommon {
  /**
   * Use lazy loading to import handler.
   */
  lazy?: boolean;
  /**
   * Path to event handler.
   */
  handler: string;
  /**
   * Event handler type.
   *
   * Default is `"web"`. If set to `"node"`, the handler will be converted into a web compatible handler.
   */
  format?: EventHandlerFormat;
  /**
   * Environments to include and bundle this handler.
   *
   * @example
   * ```ts
   * env: ["dev", "prod"]
   * env: "prerender"
   * ```
   */
  env?: MaybeArray$1<"dev" | "prod" | "prerender" | PresetName | (string & {})>;
}
/**
 * Development-only event handler with an inline handler function.
 *
 * These handlers are available only during `nitro dev` and are not
 * included in production builds.
 *
 * @see https://nitro.build/config#devhandlers
 */
interface NitroDevEventHandler extends NitroHandlerCommon {
  /**
   * Event handler function.
   */
  handler: HTTPHandler;
}
type MaybePromise<T> = T | Promise<T>;
/**
 * Custom error handler function signature.
 *
 * Receives the error, the H3 event, and a helper object containing the
 * `defaultHandler` for fallback rendering.
 *
 * @see https://nitro.build/config#errorhandler
 */
type NitroErrorHandler = (error: HTTPError, event: HTTPEvent, _: {
  defaultHandler: (error: HTTPError, event: HTTPEvent, opts?: {
    silent?: boolean;
    json?: boolean;
  }) => MaybePromise<{
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
    body?: string | Record<string, any>;
  }>;
}) => MaybePromise<Response | void>;
interface PrerenderRoute {
  route: string;
  contents?: string;
  data?: ArrayBuffer;
  fileName?: string;
  error?: Partial<HTTPError>;
  generateTimeMS?: number;
  skip?: boolean;
  contentType?: string;
}
/** @deprecated Internal type will be removed in future versions */
type PrerenderGenerateRoute = PrerenderRoute;
interface Route<T = unknown> {
  route: string;
  method: string;
  data: T;
}
declare class Router<T> {
  _routes?: Route<T>[];
  _router?: RouterContext<T>;
  _compiled?: Record<string, string>;
  _baseURL: string;
  constructor(baseURL?: string);
  get routes(): Route<T>[];
  _update(routes: Route<T>[], opts?: {
    merge?: boolean;
  }): void;
  hasRoutes(): boolean;
  compileToString(opts?: RouterCompilerOptions<T>): string;
  match(method: string, path: string): undefined | T;
  matchAll(method: string, path: string): T[];
}
type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc["length"]]>;
type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
type ExcludeFunctions<G extends Record<string, any>> = Pick<G, { [P in keyof G]: NonNullable<G[P]> extends Function ? never : P }[keyof G]>;
/** Valid HTTP status code range (100–599). */
type HTTPstatus = IntRange<100, 599>;
/**
 * Route rule options that can be applied to matching route patterns.
 *
 * Rules are matched against the request path (without query string or
 * `app.baseURL`) using rou3 pattern matching. When multiple patterns match,
 * their options are deep-merged with more-specific patterns taking precedence.
 *
 *
 * @see https://nitro.build/docs/routing#route-rules
 */
interface NitroRouteConfig {
  /**
   * Enables runtime caching.
   *
   * When set to an options object, matching handlers are wrapped with
   * `defineCachedHandler`. Set to `false` to disable caching.
   *
   * @see https://nitro.build/docs/cache
   */
  cache?: ExcludeFunctions<CachedEventHandlerOptions> | false;
  /**
   * Response headers to set for matching routes.
   *
   * @example
   * ```ts
   * headers: { 'cache-control': 's-maxage=60' }
   * ```
   *
   * @see https://nitro.build/docs/routing#headers
   */
  headers?: Record<string, string>;
  /**
   * Server-side redirect for matching routes.
   *
   * A plain string defaults to status `307`. Use an object to specify a
   * custom status code. When the rule key ends with `/**` and `to` also
   * ends with `/**`, the matched path tail is appended to the destination.
   *
   * @example
   * ```ts
   * redirect: '/new-page'
   * redirect: { to: '/new-page', status: 301 }
   * ```
   *
   * @see https://nitro.build/docs/routing#redirect
   */
  redirect?: string | {
    to: string;
    status?: HTTPstatus;
  };
  /**
   * Add this route to the prerender queue at build time.
   *
   * Only exact paths are collected; wildcard rules apply at runtime but are
   * not auto-added to the queue. Set to `false` to explicitly exclude a
   * route from prerendering.
   *
   * @see https://nitro.build/docs/routing#prerender
   */
  prerender?: boolean;
  /**
   * Proxy matching requests to another origin or internal path.
   *
   * A plain string specifies the destination. Use an object for additional
   * H3 {@link ProxyOptions}. Wildcard `/**` tail behavior works the same
   * as {@link NitroRouteConfig.redirect | redirect}.
   *
   * **IMPORTANT:** Proxy target should be a trusted and safe origin.
   *
   * @see https://nitro.build/docs/routing#proxy
   */
  proxy?: string | ({
    to: string;
  } & ProxyOptions);
  /**
   * Incremental Static Regeneration on supported platforms.
   *
   * - `number` — revalidation time in seconds.
   * - `true` — never expires until the next deployment.
   * - `false` — disable ISR for this route.
   *
   * Only handled by presets with native support (e.g. Vercel, Netlify).
   * Ignored on platforms without ISR support.
   *
   * @see https://nitro.build/docs/routing#isr-vercel
   */
  isr?: number | boolean | VercelISRConfig;
  /**
   * Protect matching routes with HTTP Basic Authentication.
   *
   * **IMPORTANT:** Depending on the deployment platform, this might not apply to public assets.
   *
   * Set to `false` to disable auth inherited from a less-specific pattern.
   *
   * @see https://nitro.build/docs/routing#basic-auth
   */
  basicAuth?: Pick<BasicAuthOptions, "password" | "username" | "realm"> | false;
  /**
   * Shortcut to add permissive CORS headers (`access-control-allow-origin: *`,
   * `access-control-allow-methods: *`, `access-control-allow-headers: *`,
   * `access-control-max-age: 0`). Override individual headers via
   * {@link NitroRouteConfig.headers | headers}.
   *
   * @see https://nitro.build/docs/routing#cors
   */
  cors?: boolean;
  /**
   * Shortcut for `cache: { swr: true, maxAge?: number }`.
   *
   * - `true` — enable SWR with no explicit `maxAge`.
   * - `number` — enable SWR with the given `maxAge` in seconds.
   *
   * @see https://nitro.build/docs/routing#caching-swr-static
   */
  swr?: boolean | number;
  static?: boolean | number;
}
/**
 * Normalized route rules used at runtime after shortcut resolution.
 */
interface NitroRouteRules extends Omit<NitroRouteConfig, "redirect" | "cors" | "swr" | "static"> {
  redirect?: {
    to: string;
    status: HTTPstatus;
  };
  proxy?: {
    to: string;
  } & ProxyOptions;
  [key: string]: any;
}
type MatchedRouteRule<K extends keyof NitroRouteRules = "custom"> = {
  name: K;
  options: Exclude<NitroRouteRules[K], false>;
  route: string;
  params?: Record<string, string>;
  /**
   * Middleware constructor. May expose an `order` property — lower runs first
   * (default `0`).
   */
  handler?: ((opts: unknown) => Middleware) & {
    order?: number;
  };
};
type MatchedRouteRules = { [K in keyof NitroRouteRules]: MatchedRouteRule<K> };
interface VercelISRConfig {
  /**
   * (vercel)
   * Expiration time (in seconds) before the cached asset will be re-generated by invoking the Serverless Function.
   * Setting the value to `false` (or `isr: true` route rule) means it will never expire.
   */
  expiration?: number | false;
  /**
   * (vercel)
   * Group number of the asset.
   * Prerender assets with the same group number will all be re-validated at the same time.
   */
  group?: number;
  /**
   * (vercel)
   * List of query string parameter names that will be cached independently.
   * - If an empty array, query values are not considered for caching.
   * - If undefined each unique query value is cached independently
   * - For wildcard `/**` route rules, `url` is always added.
   */
  allowQuery?: string[];
  /**
   * (vercel)
   * When `true`, the query string will be present on the `request` argument passed to the invoked function. The `allowQuery` filter still applies.
   */
  passQuery?: boolean;
  /**
   * (vercel)
   *
   * When `true`, expose the response body regardless of status code including error status codes. (default `false`)
   */
  exposeErrBody?: boolean;
}
type MaybeArray<T> = T | T[];
/** Nitro package metadata including version information. */
interface NitroMeta {
  version: string;
  majorVersion: number;
}
/**
 * The core Nitro instance available throughout the build lifecycle.
 *
 * Provides access to resolved options, hooks, the virtual file system,
 * scanned handlers, and utility methods.
 */
interface Nitro {
  meta: NitroMeta;
  options: NitroOptions;
  scannedHandlers: NitroEventHandler[];
  vfs: Map<string, {
    render: () => string | Promise<string>;
  }>;
  hooks: Hookable<NitroHooks>;
  unimport?: Unimport;
  logger: ConsolaInstance;
  fetch: (input: Request) => Response | Promise<Response>;
  close: () => Promise<void>;
  updateConfig: (config: NitroDynamicConfig) => void | Promise<void>;
  routing: Readonly<{
    sync: () => void;
    routeRules: Router<NitroRouteRules & {
      _route: string;
    }>;
    routes: Router<MaybeArray<NitroEventHandler & {
      _importHash: string;
    }>>;
    globalMiddleware: (NitroEventHandler & {
      _importHash: string;
    })[];
    routedMiddleware: Router<NitroEventHandler & {
      _importHash: string;
    }>;
  }>;
  _prerenderedRoutes?: PrerenderRoute[];
  _prerenderMeta?: Record<string, {
    contentType?: string;
  }>;
}
/**
 * Subset of {@link NitroConfig} that can be updated at runtime via
 * `nitro.updateConfig()`.
 */
type NitroDynamicConfig = Pick<NitroConfig, "runtimeConfig" | "routeRules">;
type NitroTypes = {
  routes: Record<string, Partial<Record<HTTPMethod | "default", string[]>>>;
  tsConfig?: TSConfig;
};
/**
 * Metadata about the framework using Nitro.
 *
 * @see https://nitro.build/config#framework
 */
interface NitroFrameworkInfo {
  name?: "nitro" | (string & {});
  version?: string;
}
/**
 * Build info written to `<output.dir>/nitro.json` (production, default
 * `.output/nitro.json`) or `<rootDir>/node_modules/.nitro/nitro.dev.json`
 * (development).
 *
 * Contains preset, framework, version, and command information.
 */
interface NitroBuildInfo {
  date: string;
  preset: PresetName;
  framework: NitroFrameworkInfo;
  versions: {
    nitro: string;
    [key: string]: string;
  };
  commands?: {
    preview?: string;
    deploy?: string;
  };
  serverEntry?: string;
  publicDir?: string;
  dev?: {
    pid: number;
    workerAddress?: WorkerAddress;
  };
  config?: Partial<PresetOptions>;
}
type RollupConfig = InputOptions$1 & {
  output?: OutputOptions$1;
};
type RolldownConfig = InputOptions & {
  output?: OutputOptions;
};
interface OXCOptions {
  minify?: MinifyOptions;
  transform?: Omit<TransformOptions, "jsx"> & {
    jsx?: Exclude<TransformOptions["jsx"], false | string>;
  };
}
type HookResult = void | Promise<void>;
interface NitroHooks {
  "types:extend": (types: NitroTypes) => HookResult;
  "build:before": (nitro: Nitro) => HookResult;
  "rollup:before": (nitro: Nitro, config: RollupConfig) => HookResult;
  compiled: (nitro: Nitro) => HookResult;
  "dev:reload": (payload?: {
    entry?: string;
    workerData?: EnvRunnerData;
  }) => HookResult;
  "dev:start": () => HookResult;
  "dev:error": (cause?: unknown) => HookResult;
  "rollup:reload": () => HookResult;
  restart: () => HookResult;
  close: () => HookResult;
  "prerender:routes": (routes: Set<string>) => HookResult;
  "prerender:config": (config: NitroConfig) => HookResult;
  "prerender:init": (prerenderer: Nitro) => HookResult;
  "prerender:generate": (route: PrerenderRoute, nitro: Nitro) => HookResult;
  "prerender:route": (route: PrerenderRoute) => HookResult;
  "prerender:done": (result: {
    prerenderedRoutes: PrerenderRoute[];
    failedRoutes: PrerenderRoute[];
  }) => HookResult;
}
/**
 * Accepted input formats for Nitro modules.
 *
 * Can be a module path string, a {@link NitroModule} object, a bare setup
 * function, or an object with a `nitro` key containing a {@link NitroModule}.
 *
 * @see https://nitro.build/config#modules
 */
type NitroModuleInput = string | NitroModule | NitroModule["setup"] | {
  nitro: NitroModule;
};
/**
 * A Nitro module that extends behavior during initialization.
 *
 * Modules receive the {@link Nitro} instance and can register hooks,
 * add handlers, modify options, or perform other setup tasks.
 *
 * @example
 * ```ts
 * export default {
 *   name: "my-module",
 *   nitro: {
 *     setup(nitro) {
 *       nitro.hooks.hook("compiled", () => {
 *         console.log("Build complete!");
 *       });
 *     },
 *   },
 * };
 * ```
 *
 * @see https://nitro.build/config#modules
 */
interface NitroModule {
  name?: string;
  setup: (this: void, nitro: Nitro) => void | Promise<void>;
}
/**
 * Swagger UI configuration options.
 *
 * @see https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
 */
interface SwaggerUIConfig {
  deepLinking?: boolean;
  displayOperationId?: boolean;
  defaultModelsExpandDepth?: number;
  defaultModelExpandDepth?: number;
  defaultModelRendering?: "example" | "model";
  displayRequestDuration?: boolean;
  docExpansion?: "list" | "full" | "none";
  filter?: boolean | string;
  persistAuthorization?: boolean;
  requestSnippetsEnabled?: boolean;
  showExtensions?: boolean;
  showCommonExtensions?: boolean;
  /** Only "alpha" is supported (function values are not JSON-serializable). */
  tagsSorter?: "alpha";
  /**
   * Note: function callbacks cannot be passed via Nitro configuration (not JSON-serializable).
   */
  onComplete?: never;
  layout?: string;
  configUrl?: string;
  oauth2RedirectUrl?: string;
  withCredentials?: boolean;
  [key: string]: unknown;
}
/**
 * Nitro OpenAPI configuration.
 *
 * @see https://nitro.build/config#openapi
 * @see https://nitro.build/docs/openapi
 */
interface NitroOpenAPIConfig {
  /**
   * OpenAPI document metadata.
   */
  meta?: {
    title?: string;
    description?: string;
    version?: string;
  };
  /**
   * Route for the OpenAPI JSON endpoint.
   *
   * @default "/_openapi.json"
   */
  route?: string;
  /**
   * Enable OpenAPI generation for production builds.
   *
   * - `"runtime"` — generate at runtime (allows middleware usage).
   * - `"prerender"` — prerender the JSON response at build time (most efficient).
   * - `false` — disable in production.
   *
   * @see https://nitro.build/config#openapi
   */
  production?: false | "runtime" | "prerender";
  /**
   * UI configurations for interactive API documentation.
   */
  ui?: {
    /**
     * Scalar UI configuration.
     *
     * Set to `false` to disable.
     */
    scalar?: false | (Partial<unknown> & {
      /**
       * Route for Scalar UI.
       *
       * @default "/_scalar"
       */
      route?: string;
    });
    /**
     * Swagger UI configuration.
     *
     * Set to `false` to disable.
     *
     * @see https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
     */
    swagger?: false | (SwaggerUIConfig & {
      /**
       * Route for Swagger UI.
       *
       * @default "/_swagger"
       */
      route?: string;
    });
  };
}
type NitroPreset = NitroConfig | (() => NitroConfig);
interface NitroPresetMeta$1 {
  name: string;
  stdName?: ProviderName;
  aliases?: string[];
  static?: boolean;
  dev?: boolean;
  compatibilityDate?: DateString;
}
type RollupCommonJSOptions = NonNullable<Parameters<typeof commonjs.default>[0]>;
/**
 * Fully resolved Nitro options available on `nitro.options`.
 *
 * These are the normalized options after preset defaults and user config
 * have been merged. For the user-facing input type, see {@link NitroConfig}.
 *
 * @see https://nitro.build/config
 */
interface NitroOptions extends PresetOptions {
  _config: NitroConfig;
  _c12: ResolvedConfig<NitroConfig> | ConfigWatcher<NitroConfig>;
  _cli?: {
    command?: string;
  };
  /**
   * Opt-in date for deployment provider and runtime compatibility features.
   *
   * Providers introduce new features that Nitro presets can leverage, but
   * some need to be explicitly opted into. Set to the latest tested date
   * in `YYYY-MM-DD` format.
   *
   * @default "latest"
   * @see https://nitro.build/config#compatibilitydate
   */
  compatibilityDate: CompatibilityDates;
  /**
   * Enables debugging nitro (build time) hooks in the console.
   *
   * @see https://nitro.build/config#debug
   */
  debug: boolean;
  /**
   * Deployment preset name.
   *
   * Determines how the production bundle is built and optimized for a
   * specific hosting provider or runtime. Auto-detected in known
   * environments when not set. Use the `NITRO_PRESET` environment
   * variable as an alternative.
   *
   * @see https://nitro.build/config#preset
   */
  preset: PresetName;
  /**
   * Disable the server build and only output prerendered static assets.
   *
   * When `true`, the server bundle is skipped entirely and only the public directory is produced.
   * Typically used by the `static` preset and its derivatives (e.g., `github-pages`, `vercel-static`).
   *
   * Note: This does not enable prerendering on its own — configure `prerender` options separately.
   *
   * @see https://nitro.build/config#static
   */
  static: boolean;
  /**
   * Log verbosity level.
   *
   * Defaults to `3`, or `1` when a testing environment is detected.
   *
   * @see https://nitro.build/config#loglevel
   * @see https://github.com/unjs/consola
   */
  logLevel: LogLevel;
  /**
   * Server runtime configuration accessible via `useRuntimeConfig()`.
   *
   * Values can be overridden at runtime using environment variables with
   * the `NITRO_` prefix. An alternative prefix can be configured via
   * `runtimeConfig.nitro.envPrefix` or `NITRO_ENV_PREFIX`.
   *
   * **Note:** The `nitro` namespace is reserved for internal use.
   *
   * @example
   * ```ts
   * runtimeConfig: {
   *   apiSecret: "default-secret", // override with NITRO_API_SECRET
   * }
   * ```
   *
   * @see https://nitro.build/config#runtimeconfig
   */
  runtimeConfig: NitroRuntimeConfig;
  /**
   * Project workspace root directory.
   *
   * Auto-detected from the workspace (e.g. pnpm workspace) when not set.
   *
   * @see https://nitro.build/config#workspacedir
   */
  workspaceDir: string;
  /**
   * Project main root directory.
   *
   * @see https://nitro.build/config#rootdir
   */
  rootDir: string;
  /**
   * Server directory for scanning `api/`, `routes/`, `plugins/`, `utils/`,
   * `middleware/`, `modules/`, and `tasks/` folders.
   *
   * Set to `false` to disable automatic directory scanning, `"./"` to use
   * the root directory, or `"./server"` to use a `server/` subdirectory.
   *
   * @default false
   * @see https://nitro.build/config#serverdir
   */
  serverDir: string | false;
  /**
   * Additional directories to scan and auto-register files such as API
   * route handlers.
   *
   * @see https://nitro.build/config#scandirs
   */
  scanDirs: string[];
  /**
   * Directory name to scan for API route handlers.
   *
   * @default "api"
   * @see https://nitro.build/config#apidir
   */
  apiDir: string;
  /**
   * Directory name to scan for route handlers.
   *
   * @default "routes"
   * @see https://nitro.build/config#routesdir
   */
  routesDir: string;
  /**
   * Nitro's temporary working directory for build-related files.
   *
   * @default "node_modules/.nitro"
   * @see https://nitro.build/config#builddir
   */
  buildDir: string;
  /**
   * Output directories for the production bundle.
   *
   * @see https://nitro.build/config#output
   */
  output: {
    /** Production output root directory. */dir: string; /** Server bundle output directory. */
    serverDir: string; /** Public/static assets output directory. */
    publicDir: string;
  };
  /** @deprecated Migrate to `serverDir`. */
  srcDir: string;
  /**
   * Storage mount configuration.
   *
   * Keys are mount-point paths; values specify the unstorage driver and
   * its options.
   *
   * @see https://nitro.build/config#storage
   * @see https://nitro.build/docs/storage
   */
  storage: StorageMounts;
  /**
   * Storage mount overrides for development mode.
   *
   * Useful for swapping production drivers (e.g. Redis) with local
   * alternatives (e.g. filesystem) during development.
   *
   * @see https://nitro.build/config#devstorage
   * @see https://nitro.build/docs/storage
   */
  devStorage: StorageMounts;
  /**
   * Database connection configurations.
   *
   * Requires `experimental.database: true`.
   *
   * @see https://nitro.build/config#database
   * @see https://nitro.build/docs/database
   */
  database: DatabaseConnectionConfigs;
  /**
   * Database connection overrides for development mode.
   *
   * @see https://nitro.build/config#devdatabase
   * @see https://nitro.build/docs/database
   */
  devDatabase: DatabaseConnectionConfigs;
  /**
   * Server-side rendering entry configuration.
   *
   * Points to the main render handler (the file should export an event
   * handler as default). Set to `false` to disable.
   *
   * @see https://nitro.build/config#renderer
   * @see https://nitro.build/docs/renderer
   */
  renderer?: {
    handler?: string;
    static?: boolean;
    template?: string;
  };
  /**
   * Routes that should be server-side rendered.
   */
  ssrRoutes: string[];
  /**
   * Include a static asset handler in the server bundle to serve public assets.
   *
   * - `true` or `"node"` — read assets from the filesystem using Node.js `fs`.
   * - `"deno"` — read assets using Deno file APIs.
   * - `"inline"` — base64-encode assets directly into the server bundle.
   * - `false` — do not serve static assets from the server (rely on a CDN or reverse proxy).
   *
   * Most self-hosted presets (e.g. `node-server`, `bun`) enable this by default.
   *
   * @see https://nitro.build/config#servestatic
   */
  serveStatic: boolean | "node" | "deno" | "inline";
  /**
   * Disable the public output directory entirely.
   *
   * Skips preparing the `.output/public` directory, copying public
   * assets, and prerendering routes.
   *
   * @see https://nitro.build/config#nopublicdir
   */
  noPublicDir: boolean;
  tracingChannel?: undefined | TracingOptions;
  /**
   * Build manifest options.
   */
  manifest?: {
    /** Custom deployment identifier included in the build manifest. */deploymentId?: string;
  };
  /**
   * Built-in feature flags.
   *
   * @see https://nitro.build/config#features
   */
  features: {
    /**
     * Enable runtime hooks for request and response.
     *
     * By default this feature will be enabled if there is at least one nitro plugin.
     */
    runtimeHooks?: boolean;
    /**
     * Enable WebSocket support.
     */
    websocket?: boolean;
  };
  /**
   * Native wasm compatibility/bundling support configuration.
   *
   * Set to `false` to disable.
   *
   * @see https://nitro.build/config#wasm
   * @see https://github.com/unjs/unwasm
   */
  wasm?: false | UnwasmPluginOptions;
  /**
   * OpenAPI specification generation and UI configuration.
   *
   * @see https://nitro.build/config#openapi
   * @see https://nitro.build/docs/openapi
   */
  openAPI?: NitroOpenAPIConfig;
  /**
   * Experimental feature flags.
   *
   * These features are not yet stable and may change in future releases.
   *
   * @see https://nitro.build/config#experimental
   */
  experimental: {
    /**
     * Enable experimental OpenAPI support
     *
     * @see https://nitro.build/docs/openapi
     */
    openAPI?: boolean;
    /**
     * See https://github.com/microsoft/TypeScript/pull/51669
     */
    typescriptBundlerResolution?: boolean;
    /**
     * Enable native async context support for useRequest()
     */
    asyncContext?: boolean;
    /**
     * Set to `false` to disable sourcemap minification in production builds.
     *
     * Sourcemap minification is enabled by default when `sourcemap` is on.
     */
    sourcemapMinify?: false;
    /**
     * Allow env expansion in runtime config
     *
     * @see https://github.com/nitrojs/nitro/pull/2043
     */
    envExpansion?: boolean;
    /**
     * Enable WebSocket upgrade support
     *
     * @deprecated Use `features.websocket` instead.
     */
    websocket?: boolean;
    /**
     * Enable experimental Database support
     *
     * @see https://nitro.build/docs/database
     */
    database?: boolean;
    /**
     * Enable experimental Tasks support
     *
     * @see https://nitro.build/docs/tasks
     */
    tasks?: boolean;
  };
  /**
   * Future features pending a major version to avoid breaking changes.
   *
   * @see https://nitro.build/config#future
   */
  future: {
    /** Opt in to Nitro's native `isr` route rule handling on Vercel and suppress backwards-compatibility warnings for legacy `swr`/`static` route options. */nativeSWR?: boolean;
  };
  /**
   * Server-side asset directories bundled at build time.
   *
   * @see https://nitro.build/config#serverassets
   * @see https://nitro.build/docs/assets#server-assets
   */
  serverAssets: ServerAssetDir[];
  /**
   * Public asset directories served in development and bundled in production.
   *
   * A `public/` directory is added by default when detected.
   *
   * @see https://nitro.build/config#publicassets
   * @see https://nitro.build/docs/assets
   */
  publicAssets: PublicAssetDir[];
  /**
   * Auto-import configuration.
   *
   * Set to `false` to disable auto-imports. Pass an object to customize.
   *
   * @default false
   * @see https://nitro.build/config#imports
   * @see https://github.com/unjs/unimport
   */
  imports: Partial<UnimportPluginOptions> | false;
  /**
   * Nitro modules to extend behavior during initialization.
   *
   * Accepts module path strings, {@link NitroModule} objects, or bare setup functions.
   *
   * @see https://nitro.build/config#modules
   */
  modules?: NitroModuleInput[];
  /**
   * Paths to Nitro runtime plugins.
   *
   * Plugins in the `plugins/` directory are auto-registered.
   *
   * @see https://nitro.build/config#plugins
   * @see https://nitro.build/docs/plugins
   */
  plugins: string[];
  /**
   * Task definitions.
   *
   * Each key is a task name with a `handler` path and optional `description`.
   *
   * @example
   * ```ts
   * tasks: {
   *   "db:migrate": {
   *     handler: "./tasks/db-migrate",
   *     description: "Run database migrations",
   *   },
   * }
   * ```
   *
   * @see https://nitro.build/config#tasks
   * @see https://nitro.build/docs/tasks
   */
  tasks: {
    [name: string]: {
      handler?: string;
      description?: string;
    };
  };
  /**
   * Map of cron expressions to task name(s).
   *
   * @example
   * ```ts
   * scheduledTasks: {
   *   "0 * * * *": "cleanup:temp",
   *   "*​/5 * * * *": ["health:check", "metrics:collect"],
   * }
   * ```
   *
   * @see https://nitro.build/config#scheduledtasks
   * @see https://nitro.build/docs/tasks
   */
  scheduledTasks: {
    [cron: string]: string | string[];
  };
  /**
   * Virtual module definitions.
   *
   * A map from dynamic virtual import names to their contents or an async
   * function that returns them.
   *
   * @see https://nitro.build/config#virtual
   */
  virtual: Record<string, string | (() => string | Promise<string>)>;
  /**
   * Pre-compress public assets and prerendered routes.
   *
   * Generates gzip and brotli (and zstd when available)
   * variants of compressible assets larger than 1024 bytes. Pass an
   * object to selectively enable/disable each encoding.
   *
   * @see https://nitro.build/config#compresspublicassets
   */
  compressPublicAssets: boolean | CompressOptions;
  /**
   * Glob patterns to ignore when scanning directories.
   *
   * @see https://nitro.build/config#ignore
   */
  ignore: string[];
  /**
   * Whether the current build targets development mode.
   *
   * Defaults to `true` during development and `false` for production.
   *
   * @see https://nitro.build/config#dev
   */
  dev: boolean;
  /**
   * Development server options.
   *
   * @see https://nitro.build/config#devserver
   */
  devServer: {
    /** Port number for the dev server. */port?: number; /** Hostname for the dev server. */
    hostname?: string; /** Additional paths to watch for dev server reloads. */
    watch?: string[]; /** Runtime runner to use for the dev server. */
    runner?: RunnerName;
  };
  /**
   * File watcher options for development mode.
   *
   * @see https://nitro.build/config#watchoptions
   * @see https://github.com/paulmillr/chokidar
   */
  watchOptions: ChokidarOptions;
  /**
   * Proxy configuration for the development server.
   *
   * A map of path prefixes to proxy target URLs or options.
   *
   * @example
   * ```ts
   * devProxy: {
   *   "/proxy/test": "http://localhost:3001",
   *   "/proxy/example": { target: "https://example.com", changeOrigin: true },
   * }
   * ```
   *
   * @see https://nitro.build/config#devproxy
   * @see https://github.com/unjs/httpxy
   */
  devProxy: Record<string, string | ProxyServerOptions>;
  /**
   * Build logging behavior.
   *
   * @see https://nitro.build/config#logging
   */
  logging: {
    /** Report compressed bundle sizes after build. */compressedSizes?: boolean; /** Show the build success message. */
    buildSuccess?: boolean;
  };
  /**
   * Server's main base URL prefix.
   *
   * Can also be set via the `NITRO_APP_BASE_URL` environment variable.
   *
   * @default "/"
   * @see https://nitro.build/config#baseurl
   */
  baseURL: string;
  /**
   * Base URL prefix for API routes.
   *
   * @default "/api"
   * @see https://nitro.build/config#apibaseurl
   */
  apiBaseURL: string;
  /**
   * Custom server entry point configuration.
   *
   * Set to `false` to disable the default server entry.
   *
   * @see https://nitro.build/docs/server-entry
   */
  serverEntry: false | {
    handler: string;
    format?: EventHandlerFormat;
  };
  /**
   * Server handler registrations.
   *
   * Handlers in `routes/`, `api/`, and `middleware/` directories are
   * auto-registered when {@link NitroOptions.serverDir | serverDir} is set.
   *
   * @see https://nitro.build/config#handlers
   * @see https://nitro.build/docs/routing
   */
  handlers: NitroEventHandler[];
  /**
   * Development-only event handlers with inline handler functions.
   *
   * Not included in production builds.
   *
   * @see https://nitro.build/config#devhandlers
   */
  devHandlers: NitroDevEventHandler[];
  /**
   * Route rules applied to matching request paths.
   *
   * Supports caching, redirects, proxying, headers, CORS, and more.
   * Rules are matched using rou3 patterns and deep-merged when multiple
   * patterns match.
   *
   * @see https://nitro.build/config#routerules
   * @see https://nitro.build/docs/routing#route-rules
   */
  routeRules: {
    [path: string]: NitroRouteRules;
  };
  /**
   * Inline route definitions.
   *
   * A map from route pattern to handler path or handler options.
   *
   * @see https://nitro.build/config#routes
   */
  routes: Record<string, string | Omit<NitroEventHandler, "route" | "middleware">>;
  /**
   * Path(s) to custom runtime error handler(s).
   *
   * Custom handlers run before the built-in error handler, which is
   * always added as a fallback.
   *
   * @see https://nitro.build/config#errorhandler
   */
  errorHandler: string | string[];
  /**
   * Custom error handler function for development mode.
   *
   * @see https://nitro.build/config#deverrorhandler
   */
  devErrorHandler: NitroErrorHandler;
  /**
   * Prerendering options.
   *
   * Routes specified here are fetched during the build and copied to
   * `.output/public` as static assets.
   *
   * @see https://nitro.build/config#prerender
   */
  prerender: {
    /**
     * Prerender HTML routes within subfolders (`/test` produces `/test/index.html`).
     */
    autoSubfolderIndex?: boolean; /** Maximum number of concurrent prerender requests. */
    concurrency?: number; /** Delay in milliseconds between prerender requests. */
    interval?: number; /** Crawl `<a>` tags in prerendered HTML to discover additional routes. */
    crawlLinks?: boolean; /** Fail the build when a route cannot be prerendered. */
    failOnError?: boolean; /** Patterns (string, RegExp, or function) of routes to skip. */
    ignore?: Array<string | RegExp | ((path: string) => undefined | null | boolean)>; /** Skip prerendering assets without a base URL prefix. */
    ignoreUnprefixedPublicAssets?: boolean; /** Explicit list of routes to prerender. */
    routes?: string[];
    /**
     * Amount of retries. Pass Infinity to retry indefinitely.
     * @default 3
     */
    retry?: number;
    /**
     * Delay between each retry in ms.
     * @default 500
     */
    retryDelay?: number;
  };
  /**
   * Bundler to use for production builds.
   *
   * Auto-detected when not set: `"vite"` if a `vite.config` with the
   * `nitro()` plugin is found, otherwise `"rolldown"` (bundled with Nitro).
   * Use the `NITRO_BUILDER` environment variable as an alternative.
   *
   * @see https://nitro.build/config#builder
   */
  builder?: "rollup" | "rolldown" | "vite";
  /**
   * Additional Rollup configuration.
   *
   * @see https://nitro.build/config#rollupconfig
   */
  rollupConfig?: RollupConfig;
  /**
   * Additional Rolldown configuration.
   *
   * @see https://nitro.build/config#rolldownconfig
   */
  rolldownConfig?: RolldownConfig;
  /**
   * Bundler entry point path.
   *
   * @see https://nitro.build/config#entry
   */
  entry: string;
  /**
   * unenv preset(s) for environment compatibility polyfills.
   *
   * @see https://nitro.build/config#unenv
   * @see https://github.com/unjs/unenv
   */
  unenv: Preset[];
  /**
   * Path aliases for module resolution.
   *
   * @example
   * ```ts
   * alias: {
   *   "~utils": "./src/utils",
   *   "#shared": "./shared",
   * }
   * ```
   *
   * @see https://nitro.build/config#alias
   */
  alias: Record<string, string>;
  /**
   * Minify the production bundle.
   *
   * @see https://nitro.build/config#minify
   */
  minify: boolean;
  /**
   * Bundle all code into a single file instead of separate chunks.
   *
   * When `false`, each route handler becomes a separate chunk loaded
   * on-demand. Some presets enable this by default.
   *
   * @see https://nitro.build/config#inlinedynamicimports
   */
  inlineDynamicImports: boolean;
  /**
   * Enable source map generation.
   *
   * @see https://nitro.build/config#sourcemap
   */
  sourcemap: boolean;
  /**
   * Target a Node.js-compatible runtime.
   *
   * When `true` (default), the bundler targets the `node` platform, prefers
   * Node.js built-in modules, and enables dependency externalization.
   *
   * When `false`, Nitro prepends the `nodeless` unenv preset to polyfill
   * Node.js globals and built-ins for non-Node runtimes (workers, edge, Deno).
   *
   * @see https://nitro.build/config#node
   */
  node: boolean;
  /**
   * OXC options for Rolldown builds (minification and transforms).
   *
   * @see https://nitro.build/config#oxc
   */
  oxc?: OXCOptions;
  /**
   * Build-time string replacements.
   *
   * @see https://nitro.build/config#replace
   */
  replace: Record<string, string | ((id: string) => string)>;
  /**
   * Additional configuration for the Rollup CommonJS plugin.
   *
   * @see https://nitro.build/config#commonjs
   */
  commonJS?: RollupCommonJSOptions;
  /**
   * Custom export conditions for module resolution.
   *
   * @see https://nitro.build/config#exportconditions
   */
  exportConditions?: string[];
  /**
   * Prevent packages from being externalized.
   *
   * Set to `true` to bundle all dependencies, or pass an array of
   * package names or patterns.
   *
   * @see https://nitro.build/config#noexternals
   */
  noExternals?: boolean | (string | RegExp)[];
  /**
   * Additional dependencies to trace and include in the build output.
   *
   * Supports `!pkg` to exclude and `pkg*` for full package trace.
   *
   * @see https://nitro.build/config#tracedeps
   */
  traceDeps?: (string | RegExp)[];
  /**
   * Advanced options for dependency tracing via nf3.
   *
   * @see https://nitro.build/config#traceopts
   * @see https://github.com/nicolo-ribaudo/nf3
   */
  traceOpts?: Pick<ExternalsTraceOptions, "nft" | "traceAlias" | "chmod" | "transform" | "hooks">;
  /**
   * TypeScript configuration options.
   *
   * @see https://nitro.build/config#typescript
   */
  typescript: {
    /** Enable strict TypeScript checks. */strict?: boolean; /** Generate types for runtime config. */
    generateRuntimeConfigTypes?: boolean; /** Generate a `tsconfig.json` in the build directory. */
    generateTsConfig?: boolean; /** Custom tsconfig overrides. */
    tsConfig?: Partial<TSConfig>;
    /**
     * Path of the generated types directory.
     *
     * @default "node_modules/.nitro/types"
     */
    generatedTypesDir?: string;
    /**
     * Path of the generated `tsconfig.json` relative to `typescript.generatedTypesDir`.
     *
     * @default "tsconfig.json"
     */
    tsconfigPath?: string;
  };
  /**
   * Nitro lifecycle hooks.
   *
   * @see https://nitro.build/config#hooks
   * @see https://nitro.build/docs/lifecycle
   * @see https://github.com/unjs/hookable
   */
  hooks: NestedHooks<NitroHooks>;
  /**
   * Preview and deploy command hints (usually filled by deployment presets).
   *
   * @see https://nitro.build/config#commands
   */
  commands: {
    /** Command to preview the production build locally. */preview?: string; /** Command to deploy the production build. */
    deploy?: string;
  };
  /**
   * Metadata about the higher-level framework using Nitro (e.g. Nuxt).
   *
   * Used by presets and included in build info output.
   *
   * @see https://nitro.build/config#framework
   */
  framework: NitroFrameworkInfo;
  /**
   * IIS-specific deployment options.
   */
  iis?: {
    /** Merge with existing IIS `web.config` instead of replacing. */mergeConfig?: boolean; /** Override existing IIS `web.config` entirely. */
    overrideConfig?: boolean;
  };
}
/**
 * User-facing Nitro configuration used in `nitro.config.ts` or
 * `defineNitroConfig()`.
 *
 * All properties are optional and will be merged with defaults and preset
 * values to produce the fully resolved {@link NitroOptions}.
 *
 * @see https://nitro.build/config
 * @see https://nitro.build/docs/configuration
 */
interface NitroConfig extends Partial<Omit<NitroOptions, "routeRules" | "rollupConfig" | "preset" | "compatibilityDate" | "unenv" | "serverDir" | "_config" | "_c12" | "serverEntry" | "renderer" | "output" | "tracingChannel">>, C12InputConfig<NitroConfig> {
  preset?: PresetNameInput;
  extends?: string | string[] | NitroPreset;
  routeRules?: {
    [path: string]: NitroRouteConfig;
  };
  rollupConfig?: Partial<RollupConfig>;
  compatibilityDate?: CompatibilityDateSpec;
  unenv?: Preset | Preset[];
  serverDir?: boolean | "./" | "./server" | (string & {});
  serverEntry?: string | NitroOptions["serverEntry"];
  renderer?: false | NitroOptions["renderer"];
  output?: Partial<NitroOptions["output"]>;
  tracingChannel?: boolean | TracingOptions;
}
/** Options for loading Nitro configuration via c12. */
interface LoadConfigOptions {
  watch?: boolean;
  c12?: WatchConfigOptions;
  compatibilityDate?: CompatibilityDateSpec;
  dotenv?: boolean | DotenvOptions;
}
/**
 * Configuration for a public asset directory served in development and
 * bundled in production.
 *
 * @see https://nitro.build/config#publicassets
 * @see https://nitro.build/docs/assets
 */
interface PublicAssetDir {
  /** URL prefix under which these assets are served. */
  baseURL?: string;
  /** Fall through to the next handler when the asset is not found. */
  fallthrough?: boolean;
  /** `Cache-Control` max-age value in seconds. */
  maxAge: number;
  /** Filesystem path to the asset directory. */
  dir: string;
  /**
   * Pass `false` to disable ignore patterns when scanning the directory,
   * or pass an array of glob patterns to ignore (overrides global
   * `nitro.ignore` patterns).
   */
  ignore?: false | string[];
}
/**
 * Pre-compression options for public assets and prerendered routes.
 *
 * @see https://nitro.build/config#compresspublicassets
 */
interface CompressOptions {
  /** Enable gzip pre-compression. */
  gzip?: boolean;
  /** Enable brotli pre-compression. */
  brotli?: boolean;
  /** Enable zstd pre-compression. */
  zstd?: boolean;
}
/**
 * Configuration for a server-side asset directory bundled at build time.
 *
 * @see https://nitro.build/config#serverassets
 * @see https://nitro.build/docs/assets#server-assets
 */
interface ServerAssetDir {
  /** Logical name used to access the asset group at runtime. */
  baseName: string;
  /** Glob pattern to filter files within the directory. */
  pattern?: string;
  /** Filesystem path to the asset directory. */
  dir: string;
  /** Glob patterns to ignore when scanning the directory. */
  ignore?: string[];
}
interface TracingOptions {
  srvx?: boolean;
  h3?: boolean;
  unstorage?: boolean;
}
/**
 * Storage mount configuration mapping mount points to driver options.
 *
 * Keys are storage mount-point paths; values specify the unstorage driver
 * and its options.
 *
 * @see https://nitro.build/config#storage
 * @see https://nitro.build/docs/storage
 */
type CustomDriverName = string & {
  _custom?: any;
};
interface StorageMounts {
  [path: string]: {
    driver: BuiltinDriverName | CustomDriverName;
    [option: string]: any;
  };
}
/** Logical database connection name. Defaults to `"default"`. */
type DatabaseConnectionName = "default" | (string & {});
/**
 * Database connection configuration specifying a db0 connector and options.
 *
 * @see https://nitro.build/config#database
 * @see https://nitro.build/docs/database
 */
type DatabaseConnectionConfig = {
  connector: ConnectorName;
  options?: {
    [key: string]: any;
  };
};
/** Map of {@link DatabaseConnectionName} to {@link DatabaseConnectionConfig}. */
type DatabaseConnectionConfigs = Record<DatabaseConnectionName, DatabaseConnectionConfig>;
/** Application-specific runtime configuration. */
interface NitroRuntimeConfigApp {
  [key: string]: any;
}
/**
 * Server runtime configuration accessible via `useRuntimeConfig()`.
 *
 * Values can be overridden at runtime using environment variables with
 * the `NITRO_` prefix. An alternative prefix can be configured via
 * `nitro.envPrefix` or `NITRO_ENV_PREFIX`.
 *
 * @see https://nitro.build/config#runtimeconfig
 */
interface NitroRuntimeConfig {
  nitro?: {
    envPrefix?: string;
    envExpansion?: boolean;
    routeRules?: {
      [path: string]: NitroRouteConfig;
    };
    openAPI?: NitroOpenAPIConfig;
  };
  [key: string]: any;
}
interface NitroImportMeta {
  dev?: boolean;
  preset?: NitroOptions["preset"];
  prerender?: boolean;
  nitro?: boolean;
  server?: boolean;
  client?: boolean;
  baseURL?: string;
  runtimeConfig?: Record<string, any>;
  _asyncContext?: boolean;
  _tasks?: boolean;
  _websocket?: boolean;
}
declare global {
  interface ImportMeta extends NitroImportMeta {}
}
type H3EventFetch = (request: NitroFetchRequest, init?: RequestInit) => Promise<Response>;
type H3Event$Fetch = Base$Fetch<unknown, NitroFetchRequest>;
declare module "srvx" {
  interface ServerRequestContext {
    routeRules?: MatchedRouteRules;
    nitro?: {
      runtimeConfig?: NitroRuntimeConfig;
      errors?: {
        error?: Error;
        context: CapturedErrorContext;
      }[];
    };
    cache?: {
      options?: CacheOptions;
    };
  }
}
export { $Fetch, AssetMeta, AvailableRouterMethod, Base$Fetch, type CacheEntry, type CacheOptions, CachedEventHandlerOptions, CaptureError, CapturedErrorContext, CompressOptions, DatabaseConnectionConfig, DatabaseConnectionConfigs, DatabaseConnectionName, type EnvRunner, EventHandlerFormat, ExtractedRouteMethod, type FetchHandler, H3Event$Fetch, H3EventFetch, HTTPstatus, InternalApi, LoadConfigOptions, MatchedRouteRule, MatchedRouteRules, MatchedRoutes, MiddlewareOf, Nitro, NitroApp, NitroAppPlugin, NitroAsyncContext, NitroBuildInfo, NitroConfig, NitroDevEventHandler, NitroDynamicConfig, NitroErrorHandler, NitroEventHandler, NitroFetchOptions, NitroFetchRequest, NitroFrameworkInfo, NitroHooks, NitroImportMeta, NitroMeta, NitroModule, NitroModuleInput, type NitroOpenAPIConfig, NitroOptions, NitroPreset, NitroPresetMeta$1 as NitroPresetMeta, NitroRouteConfig, NitroRouteMeta, NitroRouteRules, NitroRuntimeConfig, NitroRuntimeConfigApp, NitroRuntimeHooks, NitroTypes, OXCOptions, PrerenderGenerateRoute, PrerenderRoute, PublicAsset, PublicAssetDir, RenderContext, RenderHandler, RenderResponse, type ResponseCacheEntry, RolldownConfig, RollupConfig, type RunnerMessageListener, type RunnerRPCHooks, Serialize, SerializeObject, SerializeTuple, ServerAssetDir, type ServerRequest, Simplify, StorageMounts, Task, TaskContext, TaskEvent, TaskMeta, TaskPayload, TaskResult, TaskRunnerOptions, TracingOptions, TypedInternalResponse, type UpgradeHandler, VercelISRConfig, type WorkerAddress, type WorkerHooks };