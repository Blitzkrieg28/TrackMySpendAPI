const zod = require('zod');

const schemaId = zod.string().nonempty();
const schemaAmount = zod.number().min(1);
const schemaCategory = zod.string().nonempty();
const schemaDate = zod.string().refine((val) => !isNaN(Date.parse(val)));

const validationMiddleware = (req, res, next) => {
    const { id, amount, category, date } = req.body;

    const errors = [];

    if (id !== undefined) {
        const result = schemaId.safeParse(id);
        if (!result.success) errors.push(result.error.errors[0].message);
    }

    if (amount !== undefined) {
        const result = schemaAmount.safeParse(amount);
        if (!result.success) errors.push(result.error.errors[0].message);
    }

    if (category !== undefined) {
        const result = schemaCategory.safeParse(category);
        if (!result.success) errors.push(result.error.errors[0].message);
    }

    if (date !== undefined) {
        const result = schemaDate.safeParse(date);
        if (!result.success) errors.push(result.error.errors[0].message);
    }

    if (errors.length > 0) {
        return res.status(411).send({
            message: "Validation failed!",
            errors,
        });
    }

    
   req.authMessage="middleware validation successfull!!",
    
    next();
};

module.exports = validationMiddleware;
