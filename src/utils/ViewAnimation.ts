const PageViewAnimation_OBJ_FORWARDS = {
	old: {
		name: "none",
	},
	new: {
		name: "newPageAnimation",
		duration: "0.25s",
		easing: "ease-in-out",
	},
};

const NullViewAnimation_OBJ_BOTH = {
	old: {
		name: "NullAnimation",
	},
	new: {
		name: "NullAnimation",
	},
};

const PageViewAnimation_OBJ_BACKWARDS = {
	old: {
		name: "newPageAnimation",
		duration: "0.25s",
		easing: "ease-in-out",
		direction: "reverse",
	},
	new: {
		name: "spawnPageAnimation",
		duration: "0.25s",
		easing: "ease-in-out",
	},
};

const HomeViewAnimation_OBJ = {
	old: {
		name: "HomeInOldPageAnimation",
		duration: "0.25s",
		easing: "ease-in-out",
		//direction: "reverse",
	},
	new: {
		name: "HomeInAnimation",
		duration: "0.25s",
		easing: "ease-in-out",
	},
};

export const NullViewAnimation = {
	forwards: NullViewAnimation_OBJ_BOTH,
	backwards: NullViewAnimation_OBJ_BOTH,
};

export const PageViewAnimation = {
	forwards: PageViewAnimation_OBJ_FORWARDS,
	backwards: PageViewAnimation_OBJ_BACKWARDS,
};

export const HomeViewAnimation = {
	forwards: HomeViewAnimation_OBJ,
	backwards: HomeViewAnimation_OBJ,
};
