package com.github.klefstad_teaching.cs122b.idm.component;

import com.github.klefstad_teaching.cs122b.core.error.ResultError;
import com.github.klefstad_teaching.cs122b.core.result.IDMResults;
import com.github.klefstad_teaching.cs122b.idm.repo.IDMRepo;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.RefreshToken;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.User;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.type.TokenStatus;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.type.UserStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.Base64;
import java.util.List;

@Component
public class IDMAuthenticationManager
{
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String       HASH_FUNCTION = "PBKDF2WithHmacSHA512";

    private static final int ITERATIONS     = 10000;
    private static final int KEY_BIT_LENGTH = 512;

    private static final int SALT_BYTE_LENGTH = 4;

    public final IDMRepo repo;

    @Autowired
    public IDMAuthenticationManager(IDMRepo repo)
    {
        this.repo = repo;
    }

    private static byte[] hashPassword(final char[] password, String salt)
    {
        return hashPassword(password, Base64.getDecoder().decode(salt));
    }

    private static byte[] hashPassword(final char[] password, final byte[] salt)
    {
        try {
            SecretKeyFactory skf = SecretKeyFactory.getInstance(HASH_FUNCTION);

            PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_BIT_LENGTH);

            SecretKey key = skf.generateSecret(spec);

            return key.getEncoded();

        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException(e);
        }
    }

    private static byte[] genSalt()
    {
        byte[] salt = new byte[SALT_BYTE_LENGTH];
        SECURE_RANDOM.nextBytes(salt);
        return salt;
    }

    public User selectAndAuthenticateUser(String email, char[] password) throws ResultError
    {
        String sql =
                "SELECT id, email, user_status_id, salt, hashed_password " +
                        "FROM idm.user " +
                        "WHERE email = :email;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("email", email, Types.VARCHAR);


        List<User> users =
                repo.getJdbcTemplate().query(
                        sql,
                        source,

                        (rs, rowNum) ->
                                new User()
                                        .setId(rs.getInt("id"))
                                        .setEmail(rs.getString("email"))
                                        .setUserStatus(UserStatus.fromId(rs.getInt("user_status_id")))
                                        .setSalt(rs.getString("salt"))
                                        .setHashedPassword(rs.getString("hashed_password"))
                );

        if (users.size() == 0)
            throw new ResultError(IDMResults.USER_NOT_FOUND);

        User user = users.get(0);

        String givedPasswordHashed = Base64.getEncoder().encodeToString(hashPassword(password, user.getSalt()));

        if (!givedPasswordHashed.equals(user.getHashedPassword()))
            throw new ResultError(IDMResults.INVALID_CREDENTIALS);

        return user;
    }

    public void createAndInsertUser(String email, char[] password) throws DuplicateKeyException
    {

        byte[] salt = genSalt();
        byte[] passwordHashed = hashPassword(password, salt);

        String sql =
                "INSERT INTO idm.user (email, user_status_id, salt, hashed_password)" +
                        "VALUES (:email, :user_status_id, :salt, :hashed_password);";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("email", email, Types.VARCHAR)
                        .addValue("user_status_id", UserStatus.ACTIVE.id(), Types.INTEGER)
                        .addValue("salt", Base64.getEncoder().encodeToString(salt), Types.NCHAR)
                        .addValue("hashed_password", Base64.getEncoder().encodeToString(passwordHashed), Types.NCHAR);

        repo.getJdbcTemplate().update(sql, source);



    }

    public void insertRefreshToken(RefreshToken refreshToken)
    {
        String sql =
                "INSERT INTO idm.refresh_token (token, user_id, token_status_id, expire_time, max_life_time)" +
                        "VALUES (:token, :user_id, :token_status_id, :expire_time, :max_life_time);";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("token", refreshToken.getToken(), Types.NCHAR)
                        .addValue("user_id", refreshToken.getUserId(), Types.INTEGER)
                        .addValue("token_status_id", refreshToken.getTokenStatus().id(), Types.INTEGER)
                        .addValue("expire_time", Timestamp.from(refreshToken.getExpireTime()), Types.TIMESTAMP)
                        .addValue("max_life_time", Timestamp.from(refreshToken.getMaxLifeTime()), Types.TIMESTAMP);

        repo.getJdbcTemplate().update(sql, source);

    }

    public RefreshToken verifyRefreshToken(String token) throws ResultError
    {
        String sql =
                "SELECT id, token, user_id, token_status_id, expire_time, max_life_time " +
                        "FROM idm.refresh_token " +
                        "WHERE token = :token;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("token", token, Types.NCHAR);


        List<RefreshToken> refreshTokens =
                repo.getJdbcTemplate().query(
                        sql,
                        source,

                        (rs, rowNum) ->
                                new RefreshToken()
                                        .setId(rs.getInt("id"))
                                        .setToken(rs.getString("token"))
                                        .setUserId(rs.getInt("user_id"))
                                        .setTokenStatus(TokenStatus.fromId(rs.getInt("token_status_id")))
                                        .setExpireTime(rs.getTimestamp("expire_time").toInstant())
                                        .setMaxLifeTime(rs.getTimestamp("max_life_time").toInstant())
                );

        if (refreshTokens.size() == 0)
            throw new ResultError(IDMResults.REFRESH_TOKEN_NOT_FOUND);

        RefreshToken refreshToken = refreshTokens.get(0);



        return refreshToken;
    }

    public void updateRefreshTokenExpireTime(RefreshToken refreshToken)
    {
        // update expire time in DB
        String sql = "UPDATE idm.refresh_token "
                +"SET expire_time = :expire_time "
                +"WHERE token = :token;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("expire_time", Timestamp.from(refreshToken.getExpireTime()), Types.TIMESTAMP)
                        .addValue("token", refreshToken.getToken(), Types.NCHAR);

        repo.getJdbcTemplate().update(sql, source);

    }

    private void updateRefreshTokenStatus(RefreshToken refreshToken, TokenStatus tokenStatus) {
        // update token status if DB to expired
        String sql = "UPDATE idm.refresh_token "
                +"SET token_status_id = :token_status_id "
                +"WHERE token = :token;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("token_status_id", tokenStatus.id(), Types.INTEGER)
                        .addValue("token", refreshToken.getToken(), Types.NCHAR);

        repo.getJdbcTemplate().update(sql, source);
    }

    public void expireRefreshToken(RefreshToken refreshToken)
    {
        updateRefreshTokenStatus(refreshToken, TokenStatus.EXPIRED);
    }

    public void revokeRefreshToken(RefreshToken refreshToken)
    {
        updateRefreshTokenStatus(refreshToken, TokenStatus.REVOKED);
    }

    public User getUserFromRefreshToken(RefreshToken refreshToken)
    {
        String sql =
                "SELECT u.id, u.email, u.user_status_id, u.salt, u.hashed_password \n" +
                        "FROM idm.user u\n" +
                        "INNER JOIN idm.refresh_token rt ON rt.token = :refresh_token and u.id=rt.user_id;";

        MapSqlParameterSource source =
                new MapSqlParameterSource()
                        .addValue("refresh_token", refreshToken.getToken(), Types.NCHAR);


        List<User> users =
                repo.getJdbcTemplate().query(
                        sql,
                        source,

                        (rs, rowNum) ->
                                new User()
                                        .setId(rs.getInt("id"))
                                        .setEmail(rs.getString("email"))
                                        .setUserStatus(UserStatus.fromId(rs.getInt("user_status_id")))
                                        .setSalt(rs.getString("salt"))
                                        .setHashedPassword(rs.getString("hashed_password"))
                );

        return users.get(0);
    }
}
