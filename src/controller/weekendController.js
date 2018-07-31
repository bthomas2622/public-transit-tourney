import modelHash from '../data/models/modelHash';
import AgencyKeyMapper from '../util/AgencyKeyMapper.json';

const weekendController = async (req, res) => {
  const { agency } = req.query;
  const CalendarMongoModel = modelHash['calendar.txt'].model;
  const TripsMongoModel = modelHash['trips.txt'].model;
  const serviceIds = [];
  CalendarMongoModel.find({
    agency_key: AgencyKeyMapper[agency.toLowerCase()],
  }, (calendarErr, calendarDocs) => {
    if (calendarErr) {
      console.error(calendarErr);
      res.status(500).send('DB Error');
    } else {
      const routeIds = {};
      calendarDocs.forEach((doc) => {
        const docData = doc._doc;
        if (Object.prototype.hasOwnProperty.call(docData, 'saturday')) {
          if (docData.saturday === 1) {
            serviceIds.push(docData.service_id);
          } else if (Object.prototype.hasOwnProperty.call(docData, 'sunday')) {
            if (docData.sunday === 1) {
              serviceIds.push(docData.service_id);
            }
          }
        }
      });
      TripsMongoModel.find({
        agency_key: AgencyKeyMapper[agency.toLowerCase()], service_id: { $in: serviceIds },
      }, (tripErr, tripDocs) => {
        if (tripErr) {
          console.error(tripErr);
          res.status(500).send('DB Error');
        } else {
          tripDocs.forEach((doc) => {
            const docData = doc._doc;
            if (!Object.prototype.hasOwnProperty.call(routeIds, docData.route_id)) {
              routeIds[docData.route_id] = null;
            }
          });
        }
        const numWeekendRoutes = Object.keys(routeIds).length;
        res.status(200).send({ NumWeekendRoutes: numWeekendRoutes });
      });
    }
  });
};

export default weekendController;