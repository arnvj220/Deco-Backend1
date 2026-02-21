export default class commonhelper{
    static sendsuccess(res, data, message) {
        return res.status(200).json({
            status: true,
            message: message || "Success",
            data: data || null,
        });
    }
    static senderror(res, error, message) {
        return res.status(500).json({
            status: false,
            message: message || "Error",
            error: error || null,
        });
    }
    static sendvalidationerror(res, error, message) {
        return res.status(400).json({
            status: false,
            message: message || "Validation Error",
            error: error || null,
        });
    }
    static sendunauthorized(res, message) {
        return res.status(401).json({
            status: false,
            message: message || "Unauthorized",
        });
    }
    static sendnotfound(res, message) {
        return res.status(404).json({
            status: false,
            message: message || "Not Found",
        });
    }
}