module.exports =

    class Factory {
        constructor() {
            if (this.constructor == Factory) {
                throw new Error("Abstract classes Factory can't be instantiated.");
            }
        }

        init() {
            throw new Error("Method 'init()' must be implemented.");
        };

        validate() {
            throw new Error("Method 'validate()' must be implemented.");
        };

        revoke() {
            throw new Error("Method 'revoke()' must be implemented.");
        }
    }