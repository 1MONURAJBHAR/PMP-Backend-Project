class ApiResponse{ //when we create the object of this class the very first thing that is going to invoked is constructor of this class.
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
