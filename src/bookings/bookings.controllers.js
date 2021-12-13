const logger = require('../../config/logger');

const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

exports.bookParking = async (req, res) => {
    const {place, plate_number, time_booking} = req.body;
    const id_user = parseInt(req.id_user);

    try {
        // if time booking is more than 3 hours from current time, return error
        const current_time = new Date();
        current_time.setHours(current_time.getHours() + 7);
        const time_booking_date = new Date(time_booking);
        if (process.env.NODE_ENV === 'development') {
            time_booking_date.setHours(time_booking_date.getHours() + 7);
        }
        if (time_booking_date.getTime() - current_time.getTime() > 10800000) {
            return res.status(400).json({
                message: 'Time booking is more than 3 hours from current time'
            });
        } else if (time_booking_date.getTime() - current_time.getTime() < 0) {
            return res.status(400).json({
                message: 'Time booking is less than current time'
            });
        }
        const uni = await prisma.universities.findUnique({
            where: {
                name: place
            }
        });
        if (!uni) {
            return res.status(404).json({
                status: 404,
                message: 'University not found'
            })
        }
        const vehicle = await prisma.vehicles.findUnique({
            where: {
                plate_number: plate_number
            }
        });
        if (vehicle.id_user !== id_user) {
            return res.status(403).json({
                status: 403,
                message: 'You are not allowed to book this vehicle'
            })
        }
        await prisma.bookings.create({
            data: {
                id_user: id_user,
                id_place: uni.id_place,
                id_vehicle: vehicle.id_vehicle,
                time_booking: time_booking_date
            }
        });

        res.status(201).json({
            status: 201,
            message: 'Booking created'
        });
    } catch (e) {
        console.log(e)
        logger.error(e);
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}

exports.getAllBooking = async (req, res) => {
    try {
        const bookings = await prisma.bookings.findMany({where: {id_user: parseInt(req.id_user)}})
        res.status(200).json({
            status: 200,
            data: bookings
        })
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}

exports.getSingleBooking = async (req, res) => {
    const {id_booking} = req.params
    try {
        const book = await prisma.bookings.findUnique({where: {id_booking: parseInt(id_booking)}})
        res.status(200).json({
            status: 200,
            data: book
        })
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}

exports.deleteBooking = async (req, res) => {
    const {id_booking} = req.params

    try {
        await prisma.bookings.delete({where: {id_booking: parseInt(id_booking)}})
        res.status(200).json({
            status: 200,
            message: 'Booking deleted'
        })
    } catch (e) {
        if (e.code === "P2025") res.status(404).send({response: 'not found.'})
        logger.error(e)
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        })
    }
}