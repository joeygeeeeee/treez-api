module.exports =  {
    parser:  '@typescript-eslint/parser',
    parserOptions: {
        project: "./tsconfig.json"
    },
    extends:  [
        'standard-with-typescript',
        'plugin:@typescript-eslint/recommended',
    ],
    settings: {
        react: {
            version: "detect"
        }
    }
};