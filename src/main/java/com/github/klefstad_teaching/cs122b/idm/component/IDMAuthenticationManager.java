package com.github.klefstad_teaching.cs122b.idm.component;

import com.github.klefstad_teaching.cs122b.idm.repo.IDMRepo;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.RefreshToken;
import com.github.klefstad_teaching.cs122b.idm.repo.entity.User;
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

    public User selectAndAuthenticateUser(String email, char[] password)
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
            return null;

        User user = users.get(0);

        String givedPasswordHashed = Base64.getEncoder().encodeToString(hashPassword(password, Base64.getDecoder().decode(user.getSalt())));

        if (!givedPasswordHashed.equals(user.getHashedPassword()))
            return null;

        return user;
    }

    public void createAndInsertUser(String email, char[] password) throws DuplicateKeyException
    {

        byte[] salt = genSalt();
        byte[] passwordHashed = hashPassword(password, salt);

        System.out.println(salt.length);

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
    }

    public RefreshToken verifyRefreshToken(String token)
    {
        return null;
    }

    public void updateRefreshTokenExpireTime(RefreshToken token)
    {
    }

    public void expireRefreshToken(RefreshToken token)
    {
    }

    public void revokeRefreshToken(RefreshToken token)
    {
    }

    public User getUserFromRefreshToken(RefreshToken refreshToken)
    {
        return null;
    }
}
