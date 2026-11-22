export default {
    general: {
        name: "expense-optimizer"
    },

    target: {
        runtimeEnv: "node"
    },

    paths: {
        config: import.meta.url,
        native: ["src/native"],
        output: "dist"
    }
};
