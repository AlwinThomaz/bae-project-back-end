const { connection } = require("../server/connect_db");

let queryCitizensBySurname = async surname => {
  const results = await connection.query(
    "SELECT * FROM citizen WHERE surname LIKE '%" + surname + "%'"
  );
  return results[0];
};

let queryCitizen = async (surname, forenames) => {
  const results = await connection.query(
    "SELECT * FROM citizen WHERE forenames LIKE '%" +
    forenames +
    "%' AND surname LIKE '%" +
    surname +
    "%'"
  );
  return results[0];
};

let queryCitizenById = async citizenId => {
  await connection
    .query("SELECT * FROM citizen WHERE citizenId LIKE '" + citizenId + "'")
    .then(cit => {
      connection
        .query(
          "SELECT * FROM vehicle_registrations WHERE forenames LIKE '" +
          cit[0][0].forenames +
          "'" +
          " AND surname LIKE '" +
          cit[0][0].surname +
          "'"
        )
        .then(veh => {
          const toReturn = {
            citizenID: cit[0][0].citizenID,
            dateOfBirth: cit[0][0].dateOfBirth,
            homeAddress: cit[0][0].homeAddress,
            placeOfBirth: cit[0][0].placeOfBirth,
            vehicleRegistrationNo: veh[0]
          };
          console.log(toReturn);
          return toReturn;
        });
    });
};

let queryVehicle = async vehicleRegistrationNo => {
  const results = await connection.query(
    "SELECT * FROM vehicle_registrations WHERE vehicleRegistrationNo like '%" +
    vehicleRegistrationNo +
    "%'"
  );
  return results[0];
};

let queryVehicleInfoByReg = async vehicleRegistrationNo => {
  await connection
    .query("SELECT * FROM vehicle_registrations WHERE vehicleRegistrationNo LIKE '" + vehicleRegistrationNo + "'")
    .then(veh => {
      const toReturn = {
        forenames: veh[0][0].forenames,
        surname: veh[0][0].surname,
        registrationID: veh[0][0].registrationID,
        registrationDate: veh[0][0].registrationDate,
        vehicleRegistrationNo: veh[0][0].vehicleRegistrationNo,
        make: veh[0][0].make,
        model: veh[0][0].model,
        colour: veh[0][0].colour,
        driverLicenceID: veh[0][0].driverLicenceID
      };
      console.log(toReturn);
      return toReturn;
    });
};

let queryANPRInfoByVehReg = async vehicleRegistrationNo => {
  await connection
    .query("SELECT * FROM vehicle_registrations WHERE vehicleRegistrationNo LIKE '" + vehicleRegistrationNo + "'")
    .then(veh_rec => {
      connection
        .query(
          "SELECT * FROM anpr_observations WHERE vehicleRegistrationNumber LIKE '" + veh_rec[0][0].vehicleRegistrationNo + "'")
        .then(anpr_cam => {
          connection
            .query(
              "SELECT * FROM anpr_camera WHERE anprId LIKE '" + anpr_cam[0][0].anprId + "'")
            .then(veh => {
              const toReturn = {
                timestamp: veh_rec[0][0].timestamp,
                streetName: anpr_cam[0][0].streetName,
                latitude: anpr_cam[0][0].latitude,
                longtitude: anpr_cam[0][0].longtitude,
                vehicleRegistrationNo: veh[0]
              };
              console.log(toReturn);
              return toReturn;
            });
        });
    });
};

async function queryFirstLevel(queryType, surname, forenames) {
  let queryVehicleRegByName = async (forenames, surname) => {
    const results = await connection.query(
      "SELECT * FROM vehicle_registrations WHERE forenames LIKE '%" +
      forenames +
      "%' AND surname LIKE '%" +
      surname +
      "%'"
    );
    return results[0];
  };

  let querySubscriptionByName = async (forenames, surname) => {
    const results = await connection.query(
      "SELECT * FROM subscriber_records WHERE forenames LIKE '%" +
      forenames +
      "%' AND surname LIKE '%" +
      surname +
      "%'"
    );
    return results[0];
  };

  let queryBankAccByName = async (forenames, surname) => {
    const results = await connection.query(
      "SELECT * FROM bank_account_holders WHERE forenames LIKE '%" +
      forenames +
      "%' AND surname LIKE '%" +
      surname +
      "%'"
    );
    return results[0];
  };

  switch (queryType) {
    case "vehicle_registrations":
      return queryVehicleRegByName(forenames, surname);
    case "subscriber_records":
      return querySubscriptionByName(forenames, surname);
    case "bank_account_holders":
      return queryBankAccByName(forenames, surname);
  }
}

async function querySecondLevel(queryType, data) {
  let queryAnprObservations = async vehicleRegistrationNo => {
    const results = await connection.query(
      'SELECT * FROM anpr_observations WHERE vehicleRegistrationNo LIKE "' +
      vehicleRegistrationNo +
      '"'
    );
    return results[0];
  };

  let queryMobileCallRecords = async callerMSISDN => {
    const results = await connection.query(
      'SELECT * FROM mobile_call_records WHERE callerMSISDN LIKE "' +
      callerMSISDN +
      '"'
    );
    return results[0];
  };

  let queryMobileCallRecordsReciever = async receieverMSISDN => {
    const results = await connection.query(
      'SELECT * FROM mobile_call_records WHERE receieverMSISDN LIKE "' +
      receieverMSISDN +
      '"'
    );
    return results[0];
  };

  let queryEposTransactions = async payeeAccount => {
    const results = await connection.query(
      'SELECT * FROM epos_transactions WHERE payeeAccount LIKE "' +
      payeeAccount +
      '"'
    );
    return results[0];
  };

  switch (queryType) {
    case "anpr_observations":
      return queryAnprObservations(data);
    case "mobile_call_records":
      return queryMobileCallRecords(data);
    case "mobile_call_records_reciever":
      return queryMobileCallRecordsReciever(data);
    case "epos_transactions":
      return queryEposTransactions(data);
  }
}

async function queryThirdLevel(queryType, data) {
  let queryTransactionsByBankNumber = async bankCardNumber => {
    const results = await connection.query(
      'SELECT * FROM atm_transactions WHERE bankCardNumber LIKE "' +
      bankCardNumber +
      '"'
    );
    return results[0];
  };

  let queryEposTerminalsById = async eposId => {
    const results = await connection.query(
      'SELECT * FROM epos_terminals WHERE id LIKE "' + eposId + '"'
    );
    return results[0];
  };

  let queryCellTowersByTowerId = async towerId => {
    const results = await connection.query(
      'SELECT * FROM cell_towers WHERE cellTowerId LIKE "' + towerId + '"'
    );
    return results[0];
  };

  switch (queryType) {
    case "atm_transactions":
      return queryTransactionsByBankNumber(data);
    case "epos_terminals":
      return queryEposTerminalsById(data);
    case "cell_towers":
      return queryCellTowersByTowerId(data);
  }
}

async function queryFourthLevel(queryType, data) {
  let queryAnprCamera = async anprId => {
    const results = await connection.query(
      'SELECT * FROM anpr_camera WHERE anprId LIKE "' + anprId + '"'
    );
    return results[0];
  };

  let queryAtmPoint = async atmId => {
    const results = await connection.query(
      'SELECT * FROM atm_point WHERE atmId LIKE "' + callerMSISDN + '"'
    );
    return results[0];
  };

  switch (queryType) {
    case "anpr_camera":
      return queryTransactionsByBankNumber(data);
    case "atm_point":
      return queryEposTerminalsById(data);
  }
}

module.exports = {
  queryCitizensBySurname,
  queryCitizen,
  queryVehicle,
  queryCitizenById,
  queryFirstLevel,
  querySecondLevel,
  queryThirdLevel,
  queryFourthLevel,
  queryVehicleInfoByReg,
  queryANPRInfoByVehReg
};
