import compression from "compression";

export default compression({
	threshold: 1,
	filter: () => true,
});
