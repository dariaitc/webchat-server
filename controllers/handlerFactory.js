const catchAsync = require('../util/catchAsync')
const APIFeatures = require('../util/apiFeatures')
const AppError = require('../util/appError')

exports.createTwo = (Modal, ModalTwo) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Modal.create(req.body)
        const docTwo = await ModalTwo.create({
            companyId: doc._id,
        });

        if (req.ioEvent) {
            const io = req.app.get('socketio')
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc, docTwo);
            })
        }
        res.status(201).send({
            status: 'success',
            data: {
                data: doc,
                dataTwo: docTwo
            }
        })
    })
}

exports.createOne = Modal => {
    return catchAsync(async (req, res, next) => {
        const doc = await Modal.create(req.body)

        if (req.executeFuncAfterDbAction) {
            req.executeFuncAfterDbAction(doc)
        }

        if (req.ioEvent) {
            const io = req.app.get('socketio')
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc);
            })
        }

        res.status(201).send({
            status: 'success',
            data: {
                data: doc
            }
        })
    })
}

exports.createOneAddTemplateDashboard = Model => {
    return catchAsync(async (req, res, next) => {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                // Replace newlines with spaces
                req.body[key] = req.body[key].replace(/\n/g, ' ');
                // Add a space after placeholders if followed by a non-space character
                req.body[key] = req.body[key].replace(/({{[0-9]+}})(\S)/g, '$1 $2');
                // Add a space before placeholders if no space exists between text and the placeholder
                req.body[key] = req.body[key].replace(/(\S)({{[0-9]+}})/g, '$1 $2');
            }
        }

        const doc = await Model.create(req.body);

        if (req.executeFuncAfterDbAction) {
            req.executeFuncAfterDbAction(doc);
        }

        if (req.ioEvent) {
            const io = req.app.get('socketio');
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc);
            });
        }

        res.status(201).send({
            status: 'success',
            data: {
                data: doc
            }
        });
    });
}

exports.findAll = Modal => {
    return catchAsync(async (req, res, next) => {
        let docCountBeforePagination
        if (req.addCountBeforePagination) {
            const features = new APIFeatures(Modal.find(), req.query).searchByKeyword().filter().count()
            docCountBeforePagination = await features.query;

        }
        const features = new APIFeatures(Modal.find(), req.query)
            .populate()
            .searchByKeyword()
            .filter()
            .sort()
            .limitFields()
            .paginate()



        const doc = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
                docCountBeforePagination
            }
        });
    })

}

exports.updateOne = Modal => {
    return catchAsync(async (req, res, next) => {
        const doc = await Modal.findOneAndUpdate(req.searchObj, req.body, {
            new: true,
            runValidators: true
        })

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (req.executeFuncAfterDbAction) {
            req.executeFuncAfterDbAction(doc)
        }

        if (req.ioEvent) {
            const io = req.app.get('socketio')
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc);
            })
        }

        res.status(200).send({
            status: 'success',
            data: {
                data: doc
            }
        });
    })
}

exports.updateOneById = Modal => {
    return catchAsync(async (req, res, next) => {
        const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {  //findOneAndUpdate(req.searchObj, req.body, {
            new: true,
            runValidators: true
        })

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (req.executeFuncAfterDbAction) {
            req.executeFuncAfterDbAction(doc)
        }

        if (req.ioEvent) {
            const io = req.app.get('socketio')
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc);
            })
        }

        res.status(200).send({
            status: 'success',
            data: {
                data: doc
            }
        });
    })
}

exports.updateOneByIdV2 = (Model) =>
    catchAsync(async (req, res, next) => {
        let doc = await Model.findById(req.params.id)
        if (!doc) {
            return next(new AppError('No document found with that ID', 404))
        }

        Object.keys(req.body).forEach((key) => {
            if (req.body[key] === null) {
                doc[key] = undefined
            }
            else {
                doc[key] = req.body[key]
            }
        })

        doc = await doc.save({ validateBeforeSave: !!req.runValidators }) //{ runValidators: false }

        if (req.executeFuncAfterDbAction) {
            req.executeFuncAfterDbAction(doc)
        }

        if (req.ioEvent) {
            const io = req.app.get('socketio')
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc);
            })
        }

        res.status(200).send({
            status: 'success',
            data: {
                data: doc
            }
        });

    })

exports.deleteOneById = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id)

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (req.ioEvent) {
            const io = req.app.get('socketio')
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc);
            })
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findOneAndDelete(req.searchObj);

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        if (req.executeFuncAfterDbAction) {
            req.executeFuncAfterDbAction(doc)
        }

        if (req.ioEvent) {
            const io = req.app.get('socketio')
            req.ioEvent.listOfTo.forEach(el => {
                io.to(el).emit(req.ioEvent.eventName, doc);
            })
        }


        res.status(204).json({
            status: 'success',
            data: null
        });
    });