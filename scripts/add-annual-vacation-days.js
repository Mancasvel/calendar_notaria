const { MongoClient } = require('mongodb');

// IMPORTANTE: Copia aquí tu MONGODB_URI del .env.local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ksty:%C3%B1%C3%B1%C3%B1%C3%B1%C3%B1@cbddatabase.vwwhjex.mongodb.net/notaria?retryWrites=true&w=majority&appName=Notaria';
const MONGODB_DB = 'notaria';
const ANNUAL_DAYS = 23;

async function addAnnualVacationDays() {
  console.log('🔄 Conectando a MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db(MONGODB_DB);
    const usuariosCollection = db.collection('usuarios');

    // Añadir 23 días a todos los usuarios
    const result = await usuariosCollection.updateMany(
      {},
      { 
        $inc: { diasVacaciones: ANNUAL_DAYS },
        $set: { updatedAt: new Date() }
      }
    );

    console.log(`✅ ${result.modifiedCount} usuarios actualizados (+${ANNUAL_DAYS} días cada uno)`);

    // Mostrar todos los usuarios
    const usuarios = await usuariosCollection.find({}).toArray();
    console.log('\n📋 Usuarios después de la renovación anual:');
    usuarios.forEach(user => {
      console.log(`- ${user.nombre} (${user.email}): ${user.diasVacaciones || 0} días - Rol: ${user.rol}`);
    });

    console.log(`\n✅ ¡Renovación anual completada! Se añadieron ${ANNUAL_DAYS} días a cada usuario.`);
    console.log(`📅 Fecha de ejecución: ${new Date().toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

addAnnualVacationDays();
