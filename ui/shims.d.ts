declare module "*.module.css" {
	declare var classNames: Record<string>;
	export = classNames;
}
