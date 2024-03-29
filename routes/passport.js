// config/passport.js

// load all the things we need

const LocalStrategy   = require('passport-local').Strategy;
const mysql = require('mysql');
const config = require('../config/serverConfig0');
const bcrypt = require('bcrypt-nodejs');
const con_CS = mysql.createConnection(config.commondb_connection);

con_CS.query('USE ' + config.Login_db);
// expose this function to our routes using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        con_CS.query("SELECT * FROM UserLogin WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    // passport.use(
    //     'local-signup',
    //     new LocalStrategy({
    //             // by default, local strategy uses username and password, we will override with email
    //             usernameField : 'username',
    //             passwordField : 'password',
    //             passReqToCallback : true // allows us to pass back the entire request to the callback
    //         },
    //         function(req, username, password, done) {
    //             // find a user whose email is the same as the forms email
    //             // we are checking to see if the user trying to login already exists
    //             con_CS.query("SELECT * FROM Users WHERE username = ?",[username], function(err, rows) {
    //                 if (err)
    //                     return done(err);
    //                 if (rows.length) {
    //                     return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
    //                 } else {
    //                     // if there is no user with that username
    //                     // create the user
    //                     let newUserMysql = {
    //                         username: username,
    //                         password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
    //                     };
    //
    //                     let insertQuery = "INSERT INTO Users ( username, password ) values (?,?)";
    //
    //                     con_CS.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
    //                         newUserMysql.id = rows.insertId;
    //
    //                         return done(null, newUserMysql);
    //                     });
    //                 }
    //             });
    //         })
    // );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) { // callback with email and password from our form
                con_CS.query("SELECT * FROM UserLogin WHERE username = ?",[username], function(err, rows){
                    if (err)
                        return done(err);
                    if (!rows.length) {

                        return done(null, false, req.flash('loginMessage', 'Incorrect username or password.')); // req.flash is the way to set flashdata using connect-flash
                    }

                    if (rows[0].status !== "Suspended" && rows[0].status !== "Pending") {

                        // if the user is found but the password is wrong
                        if (!bcrypt.compareSync(password, rows[0].password))
                            return done(null, false, req.flash('loginMessage', 'Incorrect username or password.')); // create the loginMessage and save it to session as flashdata

                        // all is well, return successful user
                        return done(null, rows[0]);
                    } else {
                        return done(null, false, req.flash('loginMessage', 'Your account may be suspended or still pending. Please check with your Administrator or check your email.'));
                    }
                });
            })
    );
};