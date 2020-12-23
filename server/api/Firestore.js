import admin from "firebase-admin";
import serviceKeys from "../serviceKeys.json";

class Firestore {
  constructor(googleProject) {
    this.googleProject = googleProject;
  }

  async initializeFirestore() {
    let clientEmail = serviceKeys[this.googleProject].client_email;
    let privateKey = serviceKeys[this.googleProject].private_key;
    let defaultDB = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.googleProject,
        clientEmail,
        privateKey,
      }),
    });
    let db = defaultDB.firestore();
    let settings = {
      timestampsInSnapshots: true,
    };
    db.settings(settings);
    return db;
  }
}

export default Firestore;
